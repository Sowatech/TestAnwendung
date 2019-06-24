using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Sowatech.TestAnwendung.Dom
{
    [ComplexType]
    public class SmtpAccount : SmtpAccount.IUpdateParam, ISmtpAccount
    {
        [MaxLength(50), DataType(DataType.Url)]
        virtual public string serverUrl { get; set; }

        [MaxLength(50)]
        virtual public string username { get; set; }

        [MaxLength(50), DataType(DataType.Password)]
        virtual public string password { get; set; }

        [MaxLength(50), DataType(DataType.EmailAddress)]
        virtual public string email { get; set; }

        virtual public bool sslEnabled { get; set; }

        public interface IUpdateParam
        {
            string serverUrl { get; set; }

            string username { get; set; }

            string password { get; set; }

            string email { get; set; }

            bool sslEnabled { get; set; }
        }

        public void Update(IUpdateParam param)
        {
            this.serverUrl = param.serverUrl;

            this.username = param.username;

            this.email = param.email;

            this.sslEnabled = param.sslEnabled;

            if (!string.IsNullOrEmpty(param.password))
            {
                //nur neu übernehmen wenn nicht leer
                this.password = param.password;
            }
        }
        
    }

    public interface ISmtpAccount
    {
        string serverUrl { get; set; }
        string username { get; set; }
        string password { get; set; }
        string email { get; set; }
        bool sslEnabled { get; set; }
    }
}
