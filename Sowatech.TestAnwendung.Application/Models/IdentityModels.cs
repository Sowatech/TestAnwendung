using Sowatech.TestAnwendung.Dom;
using Sowatech.TestAnwendung.Dom.shared;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Sowatech.TestAnwendung.Application.Models
{
    // Sie können Profildaten für den Benutzer durch Hinzufügen weiterer Eigenschaften zur ApplicationUser-Klasse hinzufügen. Weitere Informationen finden Sie unter "http://go.microsoft.com/fwlink/?LinkID=317594".
    public class ApplicationUser : IdentityUser, IApplicationUser
    {
        public static readonly ApplicationUser Null = new ApplicationUser();

        public static ApplicationUser Create(
            IApplicationUser user,
            int? clientId,
            IApplicationUserAddParam param,
            string[] roles,
            ApplicationUserManager userManager,
            out IdentityResult identityResult
            )
        {
            var resultUser = new ApplicationUser();
            resultUser.client_id = clientId;
            resultUser.UserName = param.userName;
            resultUser.Update(user, param);
            identityResult = userManager.Create(resultUser, param.password);

            if (identityResult.Succeeded)
            {
                identityResult = resultUser.UpdateUserAuth(user, param.userGroupIds, roles, userManager);
            }
            return resultUser;
        }

        [MaxLength(100)]
        public virtual string displayName { get; set; }

        public virtual int? client_id { get; set; }
        [ComplexType]
        public class IntArray : TJsonArray<int> { }
        public IntArray userGroupIds { get; set; }
        IEnumerable<int> IApplicationUser.userGroupIds
        {
            get { return this.userGroupIds.data; }
            set { this.userGroupIds.data = value.ToArray(); }
        }

        public virtual DateTimeOffset? accessStart { get; set; }
        public virtual DateTimeOffset? accessEnd { get; set; }
        public async Task<ClaimsIdentity> GenerateUserIdentityAsync(UserManager<ApplicationUser> manager, string authenticationType)
        {
            // Beachten Sie, dass der "authenticationType" mit dem in "CookieAuthenticationOptions.AuthenticationType" definierten Typ übereinstimmen muss.
            var userIdentity = await manager.CreateIdentityAsync(this, authenticationType);
            // Benutzerdefinierte Benutzeransprüche hier hinzufügen
            return userIdentity;
        }

        public void Update(IApplicationUser user, IApplicationUserUpdateParam param)
        {
            this.displayName = param.displayName;
            this.Email = param.email;
            this.accessStart = param.accessStart;
            this.accessEnd = param.accessEnd;
        }

        public void UpdateProfile(IApplicationUser user, IApplicationUserProfileUpdateParam param)
        {
            this.displayName = param.displayName;
            this.Email = param.email;
        }

        public IdentityResult UpdateUserAuth(
            IApplicationUser user,
            IEnumerable<int> userGroupIds,
            string[] roles,
            ApplicationUserManager userManager)
        {
            this.userGroupIds.data = userGroupIds != null ? userGroupIds.ToArray() : new int[] { };
            return this.UpdateUserRoles(roles, userManager);
        }

        public IdentityResult UpdateUserAuth(
            IApplicationUser user,
            IEnumerable<UserGroup> userGroups,
            ApplicationUserManager userManager)
        {
            //int? userGroupId = userGroup != null ? userGroup.id : (int?)null;
            //var roles = userGroup != null ? userGroup.userRoles.ToArray() : new string[0];
            var roles = userGroups.SelectMany(ug => ug.userRoles).Distinct().ToArray();
            return this.UpdateUserAuth(user, userGroups.Select(ug => ug.id), roles, userManager);
        }

        private IdentityResult UpdateUserRoles(
            string[] updateRoles,
            ApplicationUserManager userManager)
        {
            userManager.RemoveFromRoles(this.Id, userManager.GetRoles(this.Id).ToArray());
            var identityResult = userManager.AddToRoles(this.Id, updateRoles);
            return identityResult;
        }

        public IdentityResult RemoveFromUserGroup(
            IApplicationUser user,
            ApplicationUserManager userManager,
            int removedUserGroupId,
            IEnumerable<UserGroup> allUserGroupsForLookup)
        {
            this.userGroupIds.data = this.userGroupIds.data.Where(ugid => ugid != removedUserGroupId).ToArray();
            var remainingUserGroups = allUserGroupsForLookup.Where(ug => this.userGroupIds.data.Contains(ug.id));
            var remainingRoles = remainingUserGroups.SelectMany(ug => ug.userRoles).Distinct().ToArray();
            return this.UpdateUserRoles(new string[0], userManager);
        }
    }

    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext()
            : base("DefaultConnection", throwIfV1Schema: false)
        {
        }

        public static ApplicationDbContext Create()
        {
            return new ApplicationDbContext();
        }
    }

}