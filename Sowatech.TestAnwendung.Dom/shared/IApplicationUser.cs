using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sowatech.TestAnwendung.Dom
{
    public interface IApplicationUser
    {   
        //in IdentityUser base
        string Id { get; set; }
        string UserName { get; set; }
        string Email { get; set; }
        //int AccessFailedCount { get; set; }
        //public virtual bool EmailConfirmed { get; set; }
        //public virtual bool LockoutEnabled { get; set; }
        //public virtual DateTime? LockoutEndDateUtc { get; set; }
        //public virtual ICollection<TLogin> Logins { get; }
        //public virtual string PasswordHash { get; set; }
        //public virtual string PhoneNumber { get; set; }
        //public virtual bool PhoneNumberConfirmed { get; set; }
        //public virtual ICollection<TRole> Roles { get; }
        //public virtual string SecurityStamp { get; set; }
        //public virtual bool TwoFactorEnabled { get; set; }

        string displayName { get; set; }
        int? client_id { get; set; }
        IEnumerable<int> userGroupIds { get; set; }
        DateTimeOffset? accessStart { get; set; }
        DateTimeOffset? accessEnd { get; set; }
    }

    public interface IApplicationUserProfileUpdateParam
    {
        string displayName { get; set; }
        string email { get; set; }
    }

    public interface IApplicationUserUpdateParam : IApplicationUserProfileUpdateParam
    {
        DateTimeOffset? accessStart { get; set; }
        DateTimeOffset? accessEnd { get; set; }
    }

    public interface IApplicationUserAddParam : IApplicationUserUpdateParam, IApplicationUserAuthParam
    {
        string userName { get; set; }
        string password { get; set; }
    }

    public interface IApplicationUserAuthParam
    {
        IEnumerable<int> userGroupIds { get; set; }
    }


    internal class DummyUser : IApplicationUser
    {
        public string Email { get; set; }
        public string Id { get; set; }
        public string UserName { get; set; }

        public DateTimeOffset? accessEnd { get; set; }
        public DateTimeOffset? accessStart { get; set; }
        public string displayName { get; set; }
        
        public int? client_id { get; set; }
        public IEnumerable<int> userGroupIds { get; set; }
    }

    public static class DummyUserFactory
    {
        public static IApplicationUser CreateDummyUser(string userName)
        {
            var user = new DummyUser();
            user.UserName = userName;
            return user;
        }
    }
}
