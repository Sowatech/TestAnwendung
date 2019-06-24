using System.Collections.Generic;
using System.Linq;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System;

namespace Sowatech.TestAnwendung.Dom
{
    public class UserGroup : ObjectDefault
    {
        public static UserGroup Create(IApplicationUser user, int clientId)
        {
            var result = new UserGroup();
            result.Init(user, clientId);
            return result;
        }

        public const string ROLENAME_ADMINISTRATOR = "Administrator";
        public static UserGroup CreateClientAdminUserGroup(IApplicationUser user)
        {
            return CreateSystemUserGroup(user, "(Administrator)", new string[] { ROLENAME_ADMINISTRATOR }, UserGroupTypes.Administrator);
        }

        private static UserGroup CreateSystemUserGroup(IApplicationUser user, string name, string[] userRoles, UserGroupTypes userGroupType)
        {
            UserGroup result = new UserGroup();
            result.Init(user, null);
            result.name = name;
            result.UserGroupType = userGroupType;
            result.userRoles = userRoles;
            return result;
        }

        protected override void Init(IApplicationUser user, int? clientId)
        {
            base.Init(user, clientId);
        }

        public enum UserGroupTypes { Standard = 0, Administrator = 1 }
        public virtual UserGroupTypes UserGroupType { get; set; }

        [MaxLength(50)]
        public virtual string name { get; set; }

        public virtual string comment { get; set; }
        public virtual string rolesCommaList { get; set; }

        public IEnumerable<string> userRoles
        {
            get
            {
                return !string.IsNullOrEmpty(rolesCommaList) ? rolesCommaList.Split(new char[] { ',' }) : new string[0];
            }
            set
            {
                rolesCommaList = value.Count() > 0 ? string.Join(",", value) : string.Empty;
            }
        }

        public interface IUpdateParam
        {
            string name { get; set; }
            string comment { get; set; }
            string[] userRoles { get; set; }
        }

        public void Update(IApplicationUser user, IUpdateParam param)
        {
            if (this.UserGroupType != UserGroupTypes.Standard) return;
            this.name = param.name;
            this.comment = param.comment;
            this.userRoles = param.userRoles;
            this.SetEdited(user);
        }

        public Dictionary<IApplicationUser, IdentityResultType> UpdateUsers<IdentityResultType>(
            IApplicationUser user,
            IEnumerable<IApplicationUser> usersOfUserGroup,
            Func<string, IList<string>> getUserIdRoles,
            Func<string, string[], IdentityResultType> removeUserIdFromRoles,
            Func<string, string[], IdentityResultType> addUserIdToRoles
            )
        {
            var identityResults = new Dictionary<IApplicationUser, IdentityResultType>();
            foreach (var userOfGroup in usersOfUserGroup.ToList())
            {
                var oldRoles = getUserIdRoles(userOfGroup.Id).ToArray();
                removeUserIdFromRoles(userOfGroup.Id, oldRoles);
                var identityResult = addUserIdToRoles(userOfGroup.Id, userRoles.ToArray());
                identityResults.Add(userOfGroup, identityResult);
            }
            return identityResults;
        }

        public bool CanDelete()
        {
            return UserGroupType == UserGroupTypes.Standard;
        }
    }
}
