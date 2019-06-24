using System.ComponentModel.DataAnnotations.Schema;

namespace Sowatech.TestAnwendung.Dom
{
    [Table("ClientSettings")]
    public class ClientSettings : ObjectDefault, SmtpAccount.IUpdateParam
    {
        public static ClientSettings Create(IApplicationUser user, int clientId)
        {
            var result = new ClientSettings();
            result.Init(user, clientId);
            return result;
        }

        protected override void Init(IApplicationUser user, int? clientId)
        {
            base.Init(user,clientId);
            this.SmtpAccount = new SmtpAccount();
        }
        
        virtual public SmtpAccount SmtpAccount { get; set; }
        
        public void UpdateSmtpAccount(IApplicationUser user, SmtpAccount.IUpdateParam updateParam)
        {
            this.SmtpAccount.Update(updateParam);
            SetEdited(user);
        }

		#region SmtpAccount.IUpdateParam
		[NotMapped]
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

		[NotMapped]
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

		[NotMapped]
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

		[NotMapped]
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

		[NotMapped]
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
