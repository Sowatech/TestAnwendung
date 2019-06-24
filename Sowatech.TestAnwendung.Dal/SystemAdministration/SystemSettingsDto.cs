using System;
using Sowatech.TestAnwendung.Dom;

namespace Sowatech.TestAnwendung.Dal.SystemAdministration
{
    public class SystemSettingsDto:SmtpAccount.IUpdateParam
    {
        public SystemSettingsDto(Dom.SystemSettings systemSettings)
        {
            smtpAccount = new SmtpAccount();
            if (systemSettings != null)
            {
                this.smtpAccount.Update(systemSettings);
            }
        }

        virtual public SmtpAccount smtpAccount { get; set; }

        #region SmtpAccount.IUpdateParam
        string SmtpAccount.IUpdateParam.serverUrl
        {
            get
            {
                return this.smtpAccount.serverUrl;
            }

            set
            {
                this.smtpAccount.serverUrl=value;
            }
        }

        string SmtpAccount.IUpdateParam.username
        {
            get
            {
                return this.smtpAccount.username;
            }

            set
            {
                this.smtpAccount.username = value;
            }
        }

        string SmtpAccount.IUpdateParam.password
        {
            get
            {
                return this.smtpAccount.password;
            }

            set
            {
                this.smtpAccount.password=value;
            }
        }

        string SmtpAccount.IUpdateParam.email
        {
            get
            {
                return this.smtpAccount.email;
            }

            set
            {
                this.smtpAccount.email=value;
            }
        }

        bool SmtpAccount.IUpdateParam.sslEnabled
        {
            get
            {
                return this.smtpAccount.sslEnabled;
            }

            set
            {
                this.smtpAccount.sslEnabled = value;
            }
        }
        #endregion

    }
}
