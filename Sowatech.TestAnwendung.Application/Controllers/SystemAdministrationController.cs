using Sowatech.TestAnwendung.Dal.SystemAdministration;
using Sowatech.TestAnwendung.Dom;
using Sowatech.WebApi;
using System;
using System.ComponentModel.Composition;
using System.Net.Mail;
using System.Web.Http;

namespace Sowatech.TestAnwendung.Application.Controllers
{
    [Export(typeof(SystemAdministrationController)), PartCreationPolicy(CreationPolicy.NonShared)]
    [UnhandledExceptionFilter]
    [Authorize(Roles = ControllerBase.RoleNameSystemAdministrator)]
    public class SystemAdministrationController : ControllerBase
    {
        [ImportingConstructor]
        public SystemAdministrationController(Dal.SystemAdministration.UnitOfWork uow)
        {
            this.uow = uow;
        }

        private Dal.SystemAdministration.UnitOfWork uow;
        
        [HttpGet]
        public SystemSettingsDto GetSystemSettings()
        {
            Logger.Debug("{0}.GetSystemSettings", GetType().FullName);
            var systemSettingsDom = uow.SystemSettings.Get(ApplicationUser);
            var dto = new SystemSettingsDto(systemSettingsDom);
            dto.smtpAccount.password = null; //Don`t send Password to Client -> Sequrity Risk!
            return dto;
        }
        
        [HttpPost]
        public void UpdateSmtpAccount(SmtpAccount updateParam)
        {
            Logger.Info("SystemAdministrationController.UpdateSmtpAccount()");
            var systemSettingsDom = uow.SystemSettings.Get(ApplicationUser);
            var isNew = systemSettingsDom.id <= 0;
            if (isNew)
            {
                uow.SystemSettings.Add(systemSettingsDom);
            }
            systemSettingsDom.UpdateSmtpAccount(ApplicationUser, updateParam);
            uow.SaveChanges();
        }

        [HttpPost]
        public string SendTestMail()
        {
            try
            {
                Logger.Info("SendTestMail()");
                var settings = uow.SystemSettings.Get(ApplicationUser);
                
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