using Sowatech.TestAnwendung.Dom;

namespace Sowatech.TestAnwendung.Dal.ClientProfile
{
    public class ClientSettingsDto
    {
        public SmtpAccount smtpAccount = new SmtpAccount();

        public ClientSettingsDto(Dom.ClientSettings clientSettings)
        {
            smtpAccount = clientSettings.SmtpAccount;
            smtpAccount.password = null;
        }

    }


}
