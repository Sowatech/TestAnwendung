using Sowatech.TestAnwendung.Application.Models;
using Sowatech.TestAnwendung.Application.Providers;
using Sowatech.TestAnwendung.Application.Results;
using Sowatech.TestAnwendung.Dal;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin.Security;
using Microsoft.Owin.Security.Cookies;
using Microsoft.Owin.Security.OAuth;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;

namespace Sowatech.TestAnwendung.Application.Controllers
{
    [Authorize]
    [RoutePrefix("Account")]
    public class AccountController : ApiController
    {
        public AccountController()
        {
        }

        public AccountController(ApplicationUserManager userManager, ISecureDataFormat<AuthenticationTicket> accessTokenFormat)
        {
            this.UserManager = userManager;
            AccessTokenFormat = accessTokenFormat;
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing && _userManager != null)
            {
                _userManager.Dispose();
                _userManager = null;
            }
            base.Dispose(disposing);
        }

        private ApplicationUserManager _userManager;
        public ApplicationUserManager UserManager
        {
            get
            {
                return _userManager ?? Request.GetOwinContext().GetUserManager<ApplicationUserManager>();
            }
            private set
            {
                _userManager = value;
            }
        }

        private ApplicationRoleManager _roleManager;
        public ApplicationRoleManager RoleManager
        {
            get
            {
                return _roleManager ?? Request.GetOwinContext().GetUserManager<ApplicationRoleManager>();
            }
            private set
            {
                _roleManager = value;
            }
        }

        public ISecureDataFormat<AuthenticationTicket> AccessTokenFormat { get; private set; }
        private const string LocalLoginProvider = "Local";

        [OverrideAuthentication]
        [AllowAnonymous]
        [HttpGet]
        public string Init()
        {
            if (!initialized)
            {
                lock (mutex)
                {
                    if (!initialized)
                    {
                        initialized = true;
                        UpdateDb();
                    }
                }
            }
            return "OK";
        }

        private static bool initialized = false;
        private static object mutex = new object();

        private void UpdateDb()
        {
            bool seed = false;
            using (ApplicationDbContext context = new ApplicationDbContext())
            {
                context.Database.Initialize(false);
                seed = !context.Users.Any();
            }
            if (seed)
            {
                SeedRoles();
                SeedSystemUserGroups();
                SeedClientUserGroup();
                SeedUsers();
            }
        }

        #region Seeder
        private void SeedRoles()
        {
            roleSystemAdministrator = CreateRoleIfNotExists(ControllerBase.RoleNameSystemAdministrator);
            CreateRoleIfNotExists(ControllerBase.RoleNameAdministrator);
            var identityRoles = new List<IdentityRole>();
            foreach (var roleName in ControllerBase.NonAdminRoleNames)
            {
                identityRoles.Add(CreateRoleIfNotExists(roleName));
            }
            rolesUser = identityRoles;
        }

        private IdentityRole roleSystemAdministrator;
        private IEnumerable<IdentityRole> rolesUser;

        private IdentityRole CreateRoleIfNotExists(string roleName)
        {
            IdentityRole role = RoleManager.FindByName(roleName);
            if (role == null)
            {
                role = new IdentityRole(roleName);
                RoleManager.Create(role);
            }
            return role;
        }

        private Dom.UserGroup systemUsergroupClientAdmin;
        private Dom.UserGroup usergroupClientStandard;

        private void SeedSystemUserGroups()
        {
            using (var efContext = new Dal.EntityFrameworkContext())
            {
                var seeder = Dom.DummyUserFactory.CreateDummyUser("seeder");
                systemUsergroupClientAdmin = Dom.UserGroup.CreateClientAdminUserGroup(seeder);
                efContext.UserGroups.Add(systemUsergroupClientAdmin);
                efContext.SaveChanges();
            }
        }

        private void SeedClientUserGroup()
        {
            using (var efContext = new Dal.EntityFrameworkContext())
            {
                var seeder = Dom.DummyUserFactory.CreateDummyUser("seeder");
                usergroupClientStandard = Dom.UserGroup.Create(seeder, 1);
                usergroupClientStandard.name = "Standard";
                usergroupClientStandard.userRoles = ControllerBase.NonAdminRoleNames;
                efContext.UserGroups.Add(usergroupClientStandard);
                efContext.SaveChanges();
            }
        }

        private void SeedUsers()
        {
            ApplicationUser administrator =
                CreateUserIfNotExists(new ApplicationUser
                {
                    UserName = "SysAdmin",
                    Email = "SysAdmin@sowatech.de"
                }, "Abcd1234!");

            ApplicationUser clientAdministrator =
                CreateUserIfNotExists(new ApplicationUser
                {
                    UserName = "TestClientAdmin",
                    Email = "TestClientAdmin@sowatech.de",
                    client_id = 1
                }, "Abcd1234!");
            ApplicationUser testUser =
                CreateUserIfNotExists(new ApplicationUser
                {
                    UserName = "TestUser",
                    Email = "TestUser@sowatech.de",
                    client_id = 1
                }, "Abcd1234!");

            AddUserToRole(administrator, roleSystemAdministrator);

            var seeder = Dom.DummyUserFactory.CreateDummyUser("seeder");
            clientAdministrator.UpdateUserAuth(seeder, new Dom.UserGroup[] { this.systemUsergroupClientAdmin }, UserManager);
            testUser.UpdateUserAuth(seeder, new Dom.UserGroup[] { this.usergroupClientStandard }, UserManager);

        }

        private ApplicationUser CreateUserIfNotExists(ApplicationUser user, string password)
        {
            ApplicationUser existing = UserManager.FindByName(user.UserName);
            if (existing != null)
            {
                return existing;
            }
            var result = UserManager.Create(user, password);
            return user;
        }

        private void AddUserToRole(ApplicationUser user, IdentityRole role)
        {
            if (!UserManager.IsInRole(user.Id, role.Name)) UserManager.AddToRole(user.Id, role.Name);
        }
        #endregion

        #region Session
        public class SessionDataDto
        {
            public string userName { get; set; }
            public string displayName { get; set; }
            public string email { get; set; }
            public int? client_id { get; set; }
            public string[] roles { get; set; }
        }

        [HttpGet]
        public SessionDataDto GetSessionData()
        {
            var user = UserManager.FindById(User.Identity.GetUserId()) ?? ApplicationUser.Null;
            return new SessionDataDto
            {
                userName = user.UserName,
                displayName = user.displayName,
                email = user.Email,
                client_id = user.client_id,
                roles = UserManager.GetRoles(User.Identity.GetUserId()).ToArray()
            };
        }
        #endregion

        #region Login / Logout

        /// <summary>
        /// Used to test / "ping" the Server Backend with the available security token
        /// </summary>
        [HttpGet]
        public void TestAuthentication()
        {
        }

        // POST api/Account/Logout
        [Route("Logout")]
        public IHttpActionResult Logout()
        {
            ApplicationUser user = UserManager.FindById(User.Identity.GetUserId());
            if (user != null)
            {
                using (EntityFrameworkContext efcontext = new EntityFrameworkContext())
                {
                    var userLog = Dom.UserLog.Create(user, Dom.LogType.Logout);
                    efcontext.UserLogs.Add(userLog);
                    efcontext.SaveChanges();
                }
            }
            Authentication.SignOut(CookieAuthenticationDefaults.AuthenticationType);
            return Ok();
        }

        // GET api/Account/UserInfo
        [HostAuthentication(DefaultAuthenticationTypes.ExternalBearer)]
        [Route("UserInfo")]
        public UserInfoViewModel GetUserInfo()
        {
            ExternalLoginData externalLogin = ExternalLoginData.FromIdentity(User.Identity as ClaimsIdentity);
            return new UserInfoViewModel
            {
                Email = User.Identity.GetUserName(),
                HasRegistered = externalLogin == null,
                LoginProvider = externalLogin != null ? externalLogin.LoginProvider : null
            };
        }

        // GET api/Account/ManageInfo?returnUrl=%2F&generateState=true
        [Route("ManageInfo")]
        public async Task<ManageInfoViewModel> GetManageInfo(string returnUrl, bool generateState = false)
        {
            IdentityUser user = await UserManager.FindByIdAsync(User.Identity.GetUserId());

            if (user == null)
            {
                return null;
            }

            List<UserLoginInfoViewModel> logins = new List<UserLoginInfoViewModel>();

            foreach (IdentityUserLogin linkedAccount in user.Logins)
            {
                logins.Add(new UserLoginInfoViewModel
                {
                    LoginProvider = linkedAccount.LoginProvider,
                    ProviderKey = linkedAccount.ProviderKey
                });
            }

            if (user.PasswordHash != null)
            {
                logins.Add(new UserLoginInfoViewModel
                {
                    LoginProvider = LocalLoginProvider,
                    ProviderKey = user.UserName,
                });
            }

            return new ManageInfoViewModel
            {
                LocalLoginProvider = LocalLoginProvider,
                Email = user.UserName,
                Logins = logins,
                ExternalLoginProviders = GetExternalLogins(returnUrl, generateState)
            };
        }


        // POST api/Account/AddExternalLogin
        [Route("AddExternalLogin")]
        public async Task<IHttpActionResult> AddExternalLogin(AddExternalLoginBindingModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            Authentication.SignOut(DefaultAuthenticationTypes.ExternalCookie);

            AuthenticationTicket ticket = AccessTokenFormat.Unprotect(model.ExternalAccessToken);

            if (ticket == null || ticket.Identity == null || (ticket.Properties != null
                && ticket.Properties.ExpiresUtc.HasValue
                && ticket.Properties.ExpiresUtc.Value < DateTimeOffset.UtcNow))
            {
                return BadRequest("Fehler bei der externen Anmeldung.");
            }

            ExternalLoginData externalData = ExternalLoginData.FromIdentity(ticket.Identity);

            if (externalData == null)
            {
                return BadRequest("Die externe Anmeldung ist bereits einem Konto zugeordnet.");
            }

            IdentityResult result = await UserManager.AddLoginAsync(User.Identity.GetUserId(),
                new UserLoginInfo(externalData.LoginProvider, externalData.ProviderKey));

            if (!result.Succeeded)
            {
                return GetErrorResult(result);
            }

            return Ok();
        }

        // POST api/Account/RemoveLogin
        [Route("RemoveLogin")]
        public async Task<IHttpActionResult> RemoveLogin(RemoveLoginBindingModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            IdentityResult result;

            if (model.LoginProvider == LocalLoginProvider)
            {
                result = await UserManager.RemovePasswordAsync(User.Identity.GetUserId());
            }
            else
            {
                result = await UserManager.RemoveLoginAsync(User.Identity.GetUserId(),
                    new UserLoginInfo(model.LoginProvider, model.ProviderKey));
            }

            if (!result.Succeeded)
            {
                return GetErrorResult(result);
            }

            return Ok();
        }

        // GET api/Account/ExternalLogin
        [OverrideAuthentication]
        [HostAuthentication(DefaultAuthenticationTypes.ExternalCookie)]
        [AllowAnonymous]
        [Route("ExternalLogin", Name = "ExternalLogin")]
        public async Task<IHttpActionResult> GetExternalLogin(string provider, string error = null)
        {
            if (error != null)
            {
                return Redirect(Url.Content("~/") + "#error=" + Uri.EscapeDataString(error));
            }

            if (!User.Identity.IsAuthenticated)
            {
                return new ChallengeResult(provider, this);
            }

            ExternalLoginData externalLogin = ExternalLoginData.FromIdentity(User.Identity as ClaimsIdentity);

            if (externalLogin == null)
            {
                return InternalServerError();
            }

            if (externalLogin.LoginProvider != provider)
            {
                Authentication.SignOut(DefaultAuthenticationTypes.ExternalCookie);
                return new ChallengeResult(provider, this);
            }

            ApplicationUser user = await UserManager.FindAsync(new UserLoginInfo(externalLogin.LoginProvider,
                externalLogin.ProviderKey));

            bool hasRegistered = user != null;

            if (hasRegistered)
            {
                Authentication.SignOut(DefaultAuthenticationTypes.ExternalCookie);

                ClaimsIdentity oAuthIdentity = await user.GenerateUserIdentityAsync(UserManager,
                   OAuthDefaults.AuthenticationType);
                ClaimsIdentity cookieIdentity = await user.GenerateUserIdentityAsync(UserManager,
                    CookieAuthenticationDefaults.AuthenticationType);

                AuthenticationProperties properties = ApplicationOAuthProvider.CreateProperties(user.UserName);
                Authentication.SignIn(properties, oAuthIdentity, cookieIdentity);
            }
            else
            {
                IEnumerable<Claim> claims = externalLogin.GetClaims();
                ClaimsIdentity identity = new ClaimsIdentity(claims, OAuthDefaults.AuthenticationType);
                Authentication.SignIn(identity);
            }

            return Ok();
        }

        // GET api/Account/ExternalLogins?returnUrl=%2F&generateState=true
        [AllowAnonymous]
        [Route("ExternalLogins")]
        public IEnumerable<ExternalLoginViewModel> GetExternalLogins(string returnUrl, bool generateState = false)
        {
            IEnumerable<AuthenticationDescription> descriptions = Authentication.GetExternalAuthenticationTypes();
            List<ExternalLoginViewModel> logins = new List<ExternalLoginViewModel>();

            string state;

            if (generateState)
            {
                const int strengthInBits = 256;
                state = RandomOAuthStateGenerator.Generate(strengthInBits);
            }
            else
            {
                state = null;
            }

            foreach (AuthenticationDescription description in descriptions)
            {
                ExternalLoginViewModel login = new ExternalLoginViewModel
                {
                    Name = description.Caption,
                    Url = Url.Route("ExternalLogin", new
                    {
                        provider = description.AuthenticationType,
                        response_type = "token",
                        client_id = Startup.PublicClientId,
                        redirect_uri = new Uri(Request.RequestUri, returnUrl).AbsoluteUri,
                        state = state
                    }),
                    State = state
                };
                logins.Add(login);
            }

            return logins;
        }
        #endregion

        #region Hilfsfunktionen

        private IAuthenticationManager Authentication
        {
            get { return Request.GetOwinContext().Authentication; }
        }

        private IHttpActionResult GetErrorResult(IdentityResult result)
        {
            if (result == null)
            {
                return InternalServerError();
            }

            if (!result.Succeeded)
            {
                if (result.Errors != null)
                {
                    foreach (string error in result.Errors)
                    {
                        ModelState.AddModelError("", error);
                    }
                }

                if (ModelState.IsValid)
                {
                    // Keine ModelState-Fehler zum Senden verfügbar, daher Rückgabe eines leeren BadRequest-Objekts.
                    return BadRequest();
                }

                return BadRequest(ModelState);
            }

            return null;
        }

        private class ExternalLoginData
        {
            public string LoginProvider { get; set; }
            public string ProviderKey { get; set; }
            public string UserName { get; set; }

            public IList<Claim> GetClaims()
            {
                IList<Claim> claims = new List<Claim>();
                claims.Add(new Claim(ClaimTypes.NameIdentifier, ProviderKey, null, LoginProvider));

                if (UserName != null)
                {
                    claims.Add(new Claim(ClaimTypes.Name, UserName, null, LoginProvider));
                }

                return claims;
            }

            public static ExternalLoginData FromIdentity(ClaimsIdentity identity)
            {
                if (identity == null)
                {
                    return null;
                }

                Claim providerKeyClaim = identity.FindFirst(ClaimTypes.NameIdentifier);

                if (providerKeyClaim == null || String.IsNullOrEmpty(providerKeyClaim.Issuer)
                    || String.IsNullOrEmpty(providerKeyClaim.Value))
                {
                    return null;
                }

                if (providerKeyClaim.Issuer == ClaimsIdentity.DefaultIssuer)
                {
                    return null;
                }

                return new ExternalLoginData
                {
                    LoginProvider = providerKeyClaim.Issuer,
                    ProviderKey = providerKeyClaim.Value,
                    UserName = identity.FindFirstValue(ClaimTypes.Name)
                };
            }
        }

        private static class RandomOAuthStateGenerator
        {
            private static RandomNumberGenerator _random = new RNGCryptoServiceProvider();

            public static string Generate(int strengthInBits)
            {
                const int bitsPerByte = 8;

                if (strengthInBits % bitsPerByte != 0)
                {
                    throw new ArgumentException("\"strengthInBits\" muss ohne Rest durch 8 teilbar sein.", "strengthInBits");
                }

                int strengthInBytes = strengthInBits / bitsPerByte;

                byte[] data = new byte[strengthInBytes];
                _random.GetBytes(data);
                return HttpServerUtility.UrlTokenEncode(data);
            }
        }

        #endregion 
    }
}