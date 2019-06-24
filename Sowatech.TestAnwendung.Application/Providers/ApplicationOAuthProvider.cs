using Sowatech.TestAnwendung.Application.Models;
using Sowatech.TestAnwendung.Dal;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin.Security;
using Microsoft.Owin.Security.Cookies;
using Microsoft.Owin.Security.OAuth;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Sowatech.TestAnwendung.Dom;
using Microsoft.AspNet.Identity;

namespace Sowatech.TestAnwendung.Application.Providers
{
    public class ApplicationOAuthProvider : OAuthAuthorizationServerProvider
    {
        private readonly string _publicClientId;

        public ApplicationOAuthProvider(string publicClientId)
        {
            if (publicClientId == null)
            {
                throw new ArgumentNullException("publicClientId");
            }

            _publicClientId = publicClientId;
        }

        enum TLoginSuccess  { None=0, Success = 1, NoAccess = 2, InvalidGrant = 3 }

        public override async Task GrantResourceOwnerCredentials(OAuthGrantResourceOwnerCredentialsContext oauthContext)
        {
            TLoginSuccess loginSuccess = TLoginSuccess.None;
            oauthContext.OwinContext.Response.Headers.Add("Access-Control-Allow-Origin", new[] { "*" });
            var userManager = oauthContext.OwinContext.GetUserManager<ApplicationUserManager>();
            var username = Uri.UnescapeDataString(oauthContext.UserName);
            var password = Uri.UnescapeDataString(oauthContext.Password);
            ApplicationUser user = await userManager.FindAsync(username, password);

            if (user == null)
            {
                oauthContext.SetError("invalid_grant", "Der Benutzername oder das Kennwort ist falsch.");
                loginSuccess = TLoginSuccess.InvalidGrant;
            }
            else
            {
                using (EntityFrameworkContext efContext = new EntityFrameworkContext())
                {
                    loginSuccess = UserTryLoginAccess(user, oauthContext);
                    if (loginSuccess == TLoginSuccess.Success)
                    {
                        loginSuccess = ClientTryLoginAccess(user, oauthContext, efContext);
                    }
                    WriteLoginLog(user, loginSuccess, efContext);
                    efContext.SaveChanges();
                }
                if (loginSuccess == TLoginSuccess.Success)
                {
                    ClaimsIdentity oAuthIdentity = await user.GenerateUserIdentityAsync(userManager,
                       OAuthDefaults.AuthenticationType);
                    ClaimsIdentity cookiesIdentity = await user.GenerateUserIdentityAsync(userManager,
                        CookieAuthenticationDefaults.AuthenticationType);

                    AuthenticationProperties properties = CreateProperties(user.UserName);
                    AuthenticationTicket ticket = new AuthenticationTicket(oAuthIdentity, properties);
                    oauthContext.Validated(ticket);
                    oauthContext.Request.Context.Authentication.SignIn(cookiesIdentity);
                }
            }
        }

        private void WriteLoginLog(ApplicationUser user, TLoginSuccess loginSuccess, EntityFrameworkContext efContext)
        {
            LogType logType;
            switch (loginSuccess)
            {
                case TLoginSuccess.Success:
                    logType = LogType.Login;
                    break;
                case TLoginSuccess.NoAccess:
                    logType = LogType.LoginAttemptWithoutAccess;
                    break;
                default:
                    logType = LogType.LoginAttemptInvalidGrant;
                    break;
            }
            var userLog = UserLog.Create(user, logType);
            efContext.UserLogs.Add(userLog);
        }

        #region TryLoginAccess
        private TLoginSuccess UserTryLoginAccess(ApplicationUser user, OAuthGrantResourceOwnerCredentialsContext oauthContext)
        {
            var success = TryLoginAccess("user", user.accessStart, user.accessEnd, oauthContext);
            return success;
        }

        private TLoginSuccess ClientTryLoginAccess(ApplicationUser user, OAuthGrantResourceOwnerCredentialsContext oauthContext, EntityFrameworkContext efContext)
        {
            TLoginSuccess success = TLoginSuccess.Success;
            if (user.client_id.HasValue)
            {
                Dom.Client client = efContext.Clients.Find(user.client_id.Value);
                success = TryLoginAccess("client", client.accessStart, client.accessEnd, oauthContext);
            }
            return success;
        }

        private TLoginSuccess TryLoginAccess(string accessEntityName, DateTimeOffset? accessStart,DateTimeOffset? accessEnd, OAuthGrantResourceOwnerCredentialsContext oauthContext)
        {
            DateTimeOffset? accessEndOfDay = accessEnd.HasValue ? accessEnd.Value.AddDays(1) : (DateTimeOffset?)null;
            var success = TLoginSuccess.Success;
            if (accessStart.HasValue && accessStart.Value > DateTimeOffset.Now)
            {
                oauthContext.SetError("access_early", accessEntityName+" access starts " + accessStart.ToString());
                success = TLoginSuccess.NoAccess;
            }
            if (accessEndOfDay.HasValue && accessEndOfDay.Value < DateTimeOffset.Now)
            {
                oauthContext.SetError("access_expired", accessEntityName + " access ended at the end of day " + accessEnd.ToString());
                success = TLoginSuccess.NoAccess;
            }
            return success;
        }
        #endregion

        private void WriteLoginLog()
        {

        }

        public override Task TokenEndpoint(OAuthTokenEndpointContext context)
        {
            foreach (KeyValuePair<string, string> property in context.Properties.Dictionary)
            {
                context.AdditionalResponseParameters.Add(property.Key, property.Value);
            }

            return Task.FromResult<object>(null);
        }

        public override Task ValidateClientAuthentication(OAuthValidateClientAuthenticationContext context)
        {
            // Die Kennwortanmeldeinformationen des Ressourcenbesitzers stellen keine Client-ID bereit.
            if (context.ClientId == null)
            {
                context.Validated();
            }

            return Task.FromResult<object>(null);
        }

        public override Task ValidateClientRedirectUri(OAuthValidateClientRedirectUriContext context)
        {
            if (context.ClientId == _publicClientId)
            {
                Uri expectedRootUri = new Uri(context.Request.Uri, "/");

                if (expectedRootUri.AbsoluteUri == context.RedirectUri)
                {
                    context.Validated();
                }
            }

            return Task.FromResult<object>(null);
        }

        public static AuthenticationProperties CreateProperties(string userName)
        {
            IDictionary<string, string> data = new Dictionary<string, string>
            {
                { "userName", userName }
            };
            return new AuthenticationProperties(data);
        }
    }
}