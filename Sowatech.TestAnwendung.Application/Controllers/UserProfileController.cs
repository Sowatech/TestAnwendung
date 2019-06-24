using Microsoft.AspNet.Identity;
using Sowatech.WebApi;
using System.ComponentModel.Composition;
using System.Web.Http;
using Sowatech.TestAnwendung.Dom;
using Sowatech.TestAnwendung.Application.Models;
using Sowatech.TestAnwendung.Dal.UserProfile;
using System.Web;
using System.Net.Mail;
//using Sowatech.TestAnwendung.Dal.UserAdministration;
using System.Linq;

namespace Sowatech.TestAnwendung.Application.Controllers
{
    [Export(typeof(UserProfileController)), PartCreationPolicy(CreationPolicy.NonShared)]
    [UnhandledExceptionFilter]
    [Authorize]
    public class UserProfileController : ControllerBase
    {

        [ImportingConstructor]
        public UserProfileController(Dal.UserProfile.UnitOfWork uow)
        {
            this.uow = uow;
        }

        private Dal.UserProfile.UnitOfWork uow;


        public class ChangePasswordParameters
        {
            public string currentPassword { get; set; }
            public string newPassword { get; set; }
        }

        [HttpPost]
        public IdentityResult ChangePassword(ChangePasswordParameters parameters)
        {
            var identityResult = UserManager.PasswordValidator.ValidateAsync(parameters.newPassword).Result;
            if (identityResult.Succeeded)
            {
                identityResult = UserManager.ChangePassword(ApplicationUser.Id, parameters.currentPassword, parameters.newPassword);
            }
            return identityResult;
        }

        [OverrideAuthentication]
        [HttpGet]
        [AllowAnonymous]
        public void SendResetPasswordMail(string username)
        {
            ApplicationUser user = UserManager.FindByName(username);
            string resetToken = UserManager.GeneratePasswordResetToken(user.Id);
            string rootUrl = HttpContext.Current.Request.UrlReferrer.AbsoluteUri;

            ClientSettings clientSettings = uow.ClientSettings.GetByClientId(user, user.client_id.Value);

            string resetLink = createPasswordResetLink(user.UserName);
            string subject = "Ihr Account bei kundenname.produktname / Passwort zurücksetzen";
            var linebreak = System.Environment.NewLine;
            string body = string.Format(@"
                        Hallo {0}, 
                        Sie erhalten diese automatische E-Mail, da Sie das Zurücksetzen Ihres Passworts angefordert haben. 
                        Dies geschieht zu Ihrem Schutz. 
                        Nur Sie, der Empfänger dieser E-Mail, können den nächsten Schritt zum Wiederherstellen des Passworts 
                        ausführen. Um Ihr Passwort zurückzusetzen und wieder Zugang zu Ihrem Konto zu erhalten, 
                        klicken Sie entweder auf die Schaltfläche oder kopieren Sie den folgenden Link (nur 24 Stunden gültig) 
                        in die Adresszeile Ihres Browsers:
                        {1}
                        {2} 
                        Vielen Dank, 
                        Ihr kundenname.produktname-Team", user.displayName, resetLink, linebreak);

            var smtpClient = createSmtpClient(clientSettings.SmtpAccount);
            smtpClient.Send(clientSettings.SmtpAccount.email, user.Email, subject, body);
        }

        private string createPasswordResetLink(string username)
        {
            var rootUrl = HttpContext.Current.Request.UrlReferrer.AbsoluteUri;
            var routingPath = "#/passwortreset";
            ApplicationUser user = UserManager.FindByName(username);
            var resetToken = UserManager.GeneratePasswordResetToken(user.Id);
            var activateLink = string.Format(
                "{0}{1};username={2};resetToken={3}",
                rootUrl,
                routingPath,
                HttpUtility.UrlEncode(user.UserName),
                HttpUtility.UrlEncode(resetToken));
            return activateLink;
        }

        private SmtpClient createSmtpClient(ISmtpAccount smtpAccount)
        {
            var smtpClient = new SmtpClient(smtpAccount.serverUrl);
            smtpClient.Credentials = new System.Net.NetworkCredential(smtpAccount.username, smtpAccount.password);
            smtpClient.EnableSsl = smtpAccount.sslEnabled;
            return smtpClient;
        }

        public class ResetPasswordParameters
        {
            public string username;
            public string resetToken;
            public string newPassword;
        }

        [OverrideAuthentication]
        [AllowAnonymous]
        [HttpPost]
        public IHttpActionResult ResetPassword([FromBody]ResetPasswordParameters parameters)
        {
            string username = HttpUtility.UrlDecode(parameters.username);
            ApplicationUser user = UserManager.FindByName(username);
            string newPassword = HttpUtility.UrlDecode(parameters.newPassword);
            IdentityResult identityResult = UserManager.ResetPassword(user.Id, parameters.resetToken, newPassword);
            if (!identityResult.Succeeded)
            {
                return GetErrorResult(identityResult);
            }
            return Ok();
        }

        [HttpGet]
        public UpdateUserProfileDto GetUpdateUserProfile()
        {
            var userProfileDto = new UpdateUserProfileDto(ApplicationUser);
            return userProfileDto;
        }

        [HttpPost]
        public IdentityResult UpdateUserProfile(UpdateUserProfileDto param)
        {
            ApplicationUser.UpdateProfile(ApplicationUser, param);
            var identityResult = UserManager.Update(ApplicationUser);

            if (identityResult.Succeeded)
            {
                UserManager.Update(ApplicationUser);
            }
            return identityResult;
        }

        #region Hilfsfunktionen


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

        #endregion Hilfsfunktionen
    }
}