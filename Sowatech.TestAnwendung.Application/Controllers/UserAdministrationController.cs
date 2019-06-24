using Microsoft.AspNet.Identity;
using Sowatech.WebApi;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using System.Linq;
using System.Security;
using System.Web.Http;
using Sowatech.TestAnwendung.Application.Models;
using Sowatech.TestAnwendung.Dal.UserAdministration;
using Sowatech.TestAnwendung.Dom;
using System;
using Sowatech.TestAnwendung.Dal;

namespace Sowatech.TestAnwendung.Application.Controllers
{
    [Export(typeof(UserAdministrationController)), PartCreationPolicy(CreationPolicy.NonShared)]
    [UnhandledExceptionFilter]
    [Authorize(Roles = ControllerBase.RoleNameSystemAdministrator + "," + ControllerBase.RoleNameAdministrator)]
    public class UserAdministrationController : ControllerBase
    {
        [ImportingConstructor]
        public UserAdministrationController(Dal.UserAdministration.UnitOfWork uow)
        {
            this.uow = uow;
        }

        private Dal.UserAdministration.UnitOfWork uow;

        [HttpGet]
        public IEnumerable<UserDto> GetUsers()
        {
            var userGroups = uow.UserGroup.GetSelectForClient(ApplicationUserClient_Id);
            var users = UserManager.Users
                       .Where(u => ApplicationUserIsSystemAdministrator || u.client_id == ApplicationUserClient_Id)
                       .ToList();
            var userDtos = users.Select(user => new UserDto(user, userGroups)).ToArray();

            return userDtos;
        }

        [HttpGet]
        public AddUserDto GetAddUser()
        {
            var userGroupSelectItems = GetUserGroupSelectItems(ApplicationUserClient_Id);
            var dto = new AddUserDto(ApplicationUserClient_Id, userGroupSelectItems);
            dto.userGroupIds = new int[] { };
            return dto;
        }

        [HttpPost]
        public IdentityResult AddUser(AddUserParams param)
        {
            IdentityResult identityResult;
            var userGroups = uow.UserGroup.GetSelectForClient(ApplicationUserClient_Id).Where(ug => param.userGroupIds.Contains(ug.id));
            var roles = userGroups.SelectMany(ug => ug.userRoles).Distinct().ToArray();
            var user = ApplicationUser.Create(ApplicationUser, ApplicationUserClient_Id, param, roles, UserManager, out identityResult);
            return identityResult;
        }

        [HttpGet]
        public UpdateUserDto GetUpdateUser(string userName)
        {
            var user = UserManager.Users.First(u => u.UserName == userName);
            AssertAccessRights(user.client_id);
            var userGroupSelectItems = GetUserGroupSelectItems(ApplicationUserClient_Id);
            var userDto = user != null ? new UpdateUserDto(user, userGroupSelectItems) : null;
            return userDto;
        }

        [HttpPost]
        public IdentityResult UpdateUser(UpdateUserParams param)
        {
            var user = UserManager.FindByName(param.userName);
            AssertAccessRights(user.client_id);
            user.Update(ApplicationUser, param);
            var identityResult = UserManager.Update(user);

            //--------------
            if (identityResult.Succeeded)
            {
                var userGroups = uow.UserGroup.GetSelectForClient(ApplicationUserClient_Id).Where(ug => param.userGroupIds.Contains(ug.id));
                identityResult = user.UpdateUserAuth(ApplicationUser, userGroups, UserManager);
                if (identityResult.Succeeded)
                {
                    identityResult = UserManager.Update(user);
                }
            }
            return identityResult;
        }

        [HttpPost]
        public void DeleteUser(string userName)
        {
            var user = UserManager.FindByName(userName);
            AssertAccessRights(user.client_id);

            if (user.Id == User.Identity.GetUserId())
            {
                throw new SecurityException("User may not delete himself");
            }
            var result = this.UserManager.Delete(user);
            if (!result.Succeeded)
            {
                throw new JsonException(result.Errors);
            }
        }

        [HttpPost]
        public IdentityResult SetPassword(SetPasswordParams parameters)
        {
            ApplicationUser admin = UserManager.FindById(User.Identity.GetUserId());
            var user = UserManager.FindByName(parameters.userName);
            AssertAccessRights(user.client_id);

            var identityResult = UserManager.PasswordValidator.ValidateAsync(parameters.password).Result;
            if (identityResult.Succeeded)
            {
                UserManager.RemovePassword(user.Id);
                identityResult = UserManager.AddPassword(user.Id, parameters.password);
            }

            return identityResult;
        }

        private SelectItem[] GetUserGroupSelectItems(int clientId)
        {
            return uow.UserGroup.GetSelectForClient(clientId)
                .Select(ug => new SelectItem(ug.id.ToString(), ug.name))
                .OrderBy(ug => ug.text)
                .ToArray();
        }

    }
}