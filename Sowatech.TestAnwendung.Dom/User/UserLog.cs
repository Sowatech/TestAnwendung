using System.Collections.Generic;
using System.Linq;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System;

namespace Sowatech.TestAnwendung.Dom
{
    [Table("UserLog")]
    public class UserLog
    {
        public static UserLog Create(IApplicationUser user,LogType logType)
        {
            var result = new UserLog();
            result.Init(user, logType);
            return result;
        }

        protected void Init(IApplicationUser user, LogType logType)
        {
            this.logType = logType;
            this.created = DateTimeOffset.Now;
            this.userName = user.UserName;
        }

        [Key]
        virtual public int id { get; set; }
        public virtual LogType logType { get; set; }
        public virtual DateTimeOffset created { get; set; }
        public virtual string userName { get; set; }
    }

    public enum LogType { Logout=0, Login=1,  LoginAttemptWithoutAccess=2, LoginAttemptInvalidGrant=3 }
}
