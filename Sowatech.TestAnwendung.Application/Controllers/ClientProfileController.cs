using Sowatech.WebApi;
using System.ComponentModel.Composition;
using System.Web.Http;
using Sowatech.TestAnwendung.Application.Models;
using System.Net.Mail;
using Sowatech.TestAnwendung.Dal.ClientProfile;
using Sowatech.TestAnwendung.Dom;
using System;

namespace Sowatech.TestAnwendung.Application.Controllers
{
    [Export(typeof(ClientProfileController)), PartCreationPolicy(CreationPolicy.NonShared)]
    [UnhandledExceptionFilter]
    [Authorize]
    public class ClientProfileController : ControllerBase
    {
        [ImportingConstructor]
        public ClientProfileController(Dal.ClientProfile.UnitOfWork uow)
        {
            this.uow = uow;
        }

        private Dal.ClientProfile.UnitOfWork uow;

        [HttpGet]
        public ClientSettingsDto GetClientSettings(int clientId)
        {
            Logger.Debug("{0}.GetClientSettings", GetType().FullName);
            AssertAccessRights(clientId);
            var settings = uow.ClientSettings.GetByClientId(ApplicationUser, clientId);
            var dto = new ClientSettingsDto(settings);
            return dto;
        }

        public class SmtpAccountDto : SmtpAccount
        {
            public int clientId;
        }

        [HttpPost]
        public void UpdateSmtpAccount(SmtpAccountDto updateParam)
        {
            Logger.Info("{0}.UpdateSmtpAccount({1})", GetType().FullName, updateParam.clientId);
            AssertAccessRights(updateParam.clientId);
            var clientSettingsDom = uow.ClientSettings.GetByClientId(ApplicationUser, updateParam.clientId);
            var isNew = clientSettingsDom.id <= 0;
            if (isNew)
            {
                uow.ClientSettings.Add(clientSettingsDom);
            }
            clientSettingsDom.UpdateSmtpAccount(ApplicationUser, updateParam);
            uow.SaveChanges();
        }

        
        [HttpPost]
        public string SendTestMail(int clientId)
        {
            try
            {
                Logger.Info("{0}.SendTestMail({1})", GetType().FullName, clientId);
                AssertAccessRights(clientId);
                var settings = uow.ClientSettings.GetByClientId(ApplicationUser, clientId);

                MailMessage mail = new MailMessage();
                mail.From = new MailAddress(settings.SmtpAccount.email);
                mail.To.Add(ApplicationUser.Email);
                mail.Subject = "Test-Email";
                mail.Body = "Diese Email wurde automatisch generiert, um SMTP Einstellungen zu testen.";
                SmtpClient smtpClient = new SmtpClient(settings.SmtpAccount.serverUrl);
                smtpClient.Credentials = new System.Net.NetworkCredential(settings.SmtpAccount.username, settings.SmtpAccount.password);
                smtpClient.EnableSsl = settings.SmtpAccount.sslEnabled;
                smtpClient.Send(mail);
                return null;
            }
            catch (Exception e)
            {
                return e.Message;
            }
        }
            
    }

}

