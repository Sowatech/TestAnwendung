using Sowatech.TestAnwendung.Dal.UserGroup;
using Microsoft.AspNet.Identity;
using Sowatech.WebApi;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using System.Linq;
using System.Security;
using System.Web.Http;

namespace Sowatech.TestAnwendung.Application.Controllers
{
    [Export(typeof(UserGroupController)), PartCreationPolicy(CreationPolicy.NonShared)]
    [UnhandledExceptionFilter]
    [Authorize(Roles = RoleNameAdministrator + "," + RoleNameSystemAdministrator)]
    public class UserGroupController : ControllerBase
    {
        [ImportingConstructor]
        public UserGroupController(UnitOfWork uow)
        {
            this.uow = uow;
        }

        private UnitOfWork uow;

        [HttpGet]
        public IEnumerable<UserGroupDto> GetUserGroups(int clientId)
        {
            var dtos = AssertAccessRights(uow.Liste.Get(clientId).ToList().AsEnumerable());
            return dtos;
        }

        [HttpGet]
        public IEnumerable<string> GetAvailableRoles()
        {
            return RoleManager.Roles
                .Where(r => r.Name != RoleNameSystemAdministrator && r.Name != RoleNameAdministrator)
                .Select(r => r.Name).ToList();
        }

        [HttpGet]
        public AddUserGroupDto GetAdd(int clientId)
        {
            AssertAccessRights(clientId);
            var dto = new AddUserGroupDto() { client_id = clientId };
            return dto;
        }

        [HttpPost]
        public int Add(AddUserGroupDto dto)
        {
            AssertAccessRights(dto.client_id);
            AssertIsSubsetOfAvailableRoles(dto.userRoles);
            Dom.UserGroup model = Dom.UserGroup.Create(ApplicationUser, dto.client_id);
            model.Update(ApplicationUser, dto);
            uow.UserGroupDom.Add(model);
            uow.SaveChanges();
            return model.id;
        }

        [HttpGet]
        public UpdateUserGroupDto GetUpdate(int userGroupId)
        {
            Dom.UserGroup model = AssertAccessRights(uow.UserGroupDom.Get(userGroupId));
            return new UpdateUserGroupDto(model);
        }

        [HttpPost]
        public void Update(UpdateUserGroupDto dto)
        {
            Dom.UserGroup userGroup = AssertAccessRights(uow.UserGroupDom.Get(dto.id));
            AssertIsSubsetOfAvailableRoles(dto.userRoles);
            var usersOfUserGroup = UserManager.Users.ToList().Where(u => u.userGroupIds.data.Contains(userGroup.id));
            userGroup.Update(ApplicationUser, dto);
            userGroup.UpdateUsers<IdentityResult>(
                ApplicationUser,
                usersOfUserGroup,
                UserManager.GetRoles, UserManager.RemoveFromRoles, UserManager.AddToRoles);
            uow.SaveChanges();
        }

        [HttpPost]
        public int Duplicate(UpdateUserGroupDto dto)
        {
            Dom.UserGroup srcModel = AssertAccessRights(uow.UserGroupDom.Get(dto.id));
            AssertIsSubsetOfAvailableRoles(dto.userRoles);
            Dom.UserGroup model = Dom.UserGroup.Create(ApplicationUser, srcModel.client_id.Value);
            model.Update(ApplicationUser, dto);
            uow.UserGroupDom.Add(model);
            uow.SaveChanges();
            return model.id;
        }

        [HttpPost]
        public void Delete(int id)
        {
            Dom.UserGroup userGroup = AssertAccessRights(uow.UserGroupDom.Get(id));
            var usersOfUserGroup = UserManager.Users.ToList().Where(u => u.userGroupIds.data.Contains(userGroup.id));
            foreach (var user in usersOfUserGroup)
            {
                user.RemoveFromUserGroup(ApplicationUser, UserManager, userGroup.id, uow.UserGroupDom.GetAll(ApplicationUserClient_Id));
                UserManager.Update(user);
            }
            uow.UserGroupDom.Delete(id);
            uow.SaveChanges();
        }

        #region UserRole Helper

        private string[] AssertIsSubsetOfAvailableRoles(string[] roles)
        {
            var availableRoles = GetAvailableRoles();
            if (roles != null && roles.Length > 0 && !roles.All(r => availableRoles.Contains(r))) throw new SecurityException("UserGroupController.AssertIsSubsetOfAvailableRoles violated by " + this.ApplicationUser.UserName);
            return roles;
        }

        #endregion UserRole Helper
    }
}