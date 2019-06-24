using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Sowatech.TestAnwendung.Dom
{
    [Table("SystemSettings")]
    public class SystemSettings : SmtpAccount.IUpdateParam
    {
        public static SystemSettings Create(IApplicationUser user) {
            var result = new SystemSettings();
            result.Init(user);
            return result;
        }


        [Key]
        virtual public int id { get; set; }

        protected void Init (IApplicationUser user) 
        {
            SmtpAccount = new SmtpAccount();
        }

        virtual public SmtpAccount SmtpAccount { get; set; }
        
        public void UpdateSmtpAccount(IApplicationUser user, SmtpAccount.IUpdateParam updateParam)
        {
            this.SmtpAccount.Update(updateParam);
            //SetEdited(user);
        }


        #region SystemSettings.IUpdateParam
        public string serverUrl
        {
            get
            {
                return this.SmtpAccount.serverUrl;
            }

            set
            {
                this.SmtpAccount.serverUrl = value;
            }
        }

        public string username
        {
            get
            {
                return this.SmtpAccount.username;
            }

            set
            {
                this.SmtpAccount.username = value;
            }
        }

        public string password
        {
            get
            {
                return this.SmtpAccount.password;
            }

            set
            {
                this.SmtpAccount.password = value;
            }
        }

        public string email
        {
            get
            {
                return this.SmtpAccount.email;
            }

            set
            {
                this.SmtpAccount.email = value;
            }
        }

        public bool sslEnabled
        {
            get
            {
                return this.SmtpAccount.sslEnabled;
            }

            set
            {
                this.SmtpAccount.sslEnabled = value;
            }
        }
        #endregion
    }
}
