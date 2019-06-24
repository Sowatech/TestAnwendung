using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Sowatech.TestAnwendung.Dom
{
    [ComplexType]
    public class TCommunication: TCommunication.IUpdateParam
    {
        [MaxLength(50), DataType(DataType.PhoneNumber)]
        public virtual string phone { get; set; }

        [MaxLength(50), DataType(DataType.PhoneNumber)]
        public virtual string fax { get; set; }

        [MaxLength(50), DataType(DataType.PhoneNumber)]
        public virtual string mobilePhone { get; set; }

        [MaxLength(100), DataType(DataType.EmailAddress)]
        public virtual string email { get; set; }

        public TCommunication Clone()
        {
            var result = new TCommunication();
            result.Update(this);
            return result;
        }

        public interface IUpdateParam
        {
            string phone { get; set; }
            string fax { get; set; }
            string mobilePhone { get; set; }
            string email { get; set; }
        }

        public void Update(IUpdateParam param)
        {
            this.phone = param.phone;
            this.fax = param.fax;
            this.mobilePhone = param.mobilePhone;
            this.email = param.email;
        }

        public void Clear()
        {
            this.phone = "";
            this.fax = "";
            this.mobilePhone = "";
            this.email = "";
        }
    }

    public static class TCommunicationFactory
    {

        private static Random rnd = new Random(4711);
        private static string[] domainNames = { "online.de", "test4711.de", "myx.de" };
        private static string[] mailPrefixes = { "mail", "post", "me", "test", "adress","sendme" };
        private static string[] mobilePrefixes = { "0170", "0160", "0177" };
        private static string[] phonePrefixes = { "0221", "0345", "0996" };

        public static TCommunication CreateRandom()
        {
            
            var result = new TCommunication
            {
                phone = phonePrefixes[rnd.Next(phonePrefixes.Length)]+"-"+rnd.Next(80000)+10000,
                mobilePhone = mobilePrefixes[rnd.Next(mobilePrefixes.Length)] + "-" + rnd.Next(80000) + 10000,
                email = mailPrefixes[rnd.Next(mailPrefixes.Length)]+rnd.Next(1000)+"@"+ domainNames[rnd.Next(domainNames.Length)]
            };

            return result;
        }

    }
}