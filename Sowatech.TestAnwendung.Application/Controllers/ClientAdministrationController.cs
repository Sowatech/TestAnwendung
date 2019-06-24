using Sowatech.TestAnwendung.Application.Models;
using Sowatech.TestAnwendung.Dal.ClientAdministration;
using Sowatech.TestAnwendung.Dal.UserAdministration;
using Sowatech.TestAnwendung.Dom;
using Microsoft.AspNet.Identity;
using Sowatech.WebApi;
using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using System.Linq;
using System.Security;
using System.Web.Http;

namespace Sowatech.TestAnwendung.Application.Controllers
{
    [Export(typeof(ClientAdministrationController)), PartCreationPolicy(CreationPolicy.NonShared)]
    [UnhandledExceptionFilter]
    [Authorize(Roles = ControllerBase.RoleNameSystemAdministrator)]
    public class ClientAdministrationController : ControllerBase
    {

        [ImportingConstructor]
        public ClientAdministrationController(Dal.ClientAdministration.UnitOfWork uow)
        {
            this.uow = uow;
        }
        private Dal.ClientAdministration.UnitOfWork uow;

        [HttpGet]
        public IEnumerable<ClientDto> List()
        {
            Logger.Debug("{0}.Liste", GetType().FullName);
            return uow.Liste.Get().Select(client => new ClientDto(client));
        }

        [HttpGet]
        public ClientDto Detail(int id)
        {
            var client = AssertAccessRights(uow.Client.Get(id));
            return new ClientDto(client);
        }

        [HttpGet]
        public UpdateClientDto GetUpdate(int id)
        {
            var client = AssertAccessRights(uow.Client.Get(id));
            return new UpdateClientDto(client);
        }

        [HttpPost]
        public int Update(UpdateClientDto dto)
        {
            var client = AssertAccessRights(uow.Client.Get(dto.id));
            client.Update(ApplicationUser, dto);
            uow.SaveChanges();
            return client.id;
        }

        public class InsertResult
        {
            public IdentityResult identityResult { get; set; }
            public int? clientId { get; set; }
        }

        [HttpPost]
        public InsertResult Insert(InsertClientDto dto)
        {
            var insertResult = new InsertResult();
            //1) try create admin-user without client
            insertResult.identityResult = this.AddUser(null, dto);
            if (insertResult.identityResult.Succeeded)
            {
                //2) create client
                var client = Client.Create(ApplicationUser);
                client.Update(ApplicationUser, dto);
                uow.Client.Add(client);

                uow.SaveChanges();
                insertResult.clientId = client.id;

                //3) reference newly created admin-user to created client
                var succeededUser = UserManager.Users.FirstOrDefault(u => u.UserName == dto.userName);
                succeededUser.client_id = client.id;
                UserManager.Update(succeededUser);

                //4) create Standard UserGroup
                var userGroup = UserGroup.Create(ApplicationUser, client.id);
                userGroup.name = client.name + "-Standard";
                userGroup.userRoles = ControllerBase.NonAdminRoleNames;
                uow.UserGroup.Add(userGroup);
                uow.SaveChanges();
            }

            return insertResult;
        }

        [HttpPost]
        public void DeleteClient(int clientId)
        {
            AssertAccessRights(clientId);
            DeleteAllUsers(clientId);
            uow.Client.Delete(clientId);
            uow.SaveChanges();
        }

        private void DeleteAllUsers(int clientId)
        {
            IEnumerable<ApplicationUser> usersOfClient = UserManager.Users
                .Where(u => u.client_id == clientId)
                .ToList();
            foreach (ApplicationUser user in usersOfClient)
            {
                AssertAccessRights(user.client_id);
                this.DeleteUser(user.UserName);
            }
        }


        #region Client Users (Administrators)

        [HttpGet]
        public IEnumerable<UserDto> GetUsers(int clientId)
        {
            var clientAdminUserGroup = uow.UserGroup.GetClientAdministratorUserGroup();
            var clientAdministrators = UserManager.Users
                    .Where(u => u.client_id == clientId).ToList()
                    .Where(u => u.userGroupIds.data.Contains(clientAdminUserGroup.id)).ToList()
                    .Select(user => new UserDto(user, new UserGroup[] { clientAdminUserGroup })).ToArray();
            return clientAdministrators;
        }

        [HttpGet]
        public AddUserDto GetAddUser(int clientId)
        {
            var adminUserGroup = uow.UserGroup.GetClientAdministratorUserGroup();
            var selectItems = new Dom.SelectItem[1] { new Dom.SelectItem(adminUserGroup.id.ToString(), adminUserGroup.name) };
            var dto = new AddUserDto(clientId, selectItems);
            dto.userGroupIds = new int[] { adminUserGroup.id };
            return dto;
        }

        [HttpPost]
        public IdentityResult AddUser(AddUserParams param)
        {
            return AddUser(param.client_id, param);
        }

        private IdentityResult AddUser(int? clientId, IApplicationUserAddParam param)
        {
            IdentityResult identityResult;
            var user = ApplicationUser.Create(ApplicationUser, clientId, param, new string[0], UserManager, out identityResult);
            if (identityResult.Succeeded)
            {
                var adminUserGroup = uow.UserGroup.GetClientAdministratorUserGroup();
                identityResult = user.UpdateUserAuth(ApplicationUser, new UserGroup[] { adminUserGroup }, UserManager);
            }
            return identityResult;
        }

        [HttpGet]
        public UpdateUserDto GetUpdateUser(string userName)
        {
            var user = UserManager.Users.FirstOrDefault(u => u.UserName == userName);
            return new UpdateUserDto(user);
        }

        [HttpPost]
        public void UpdateUser(UpdateUserParams param)
        {
            var user = UserManager.FindByName(param.userName);
            AssertAccessRights(user.client_id);
            user.Update(ApplicationUser, param);
            var identityResult = UserManager.Update(user);

            //--in client users keine anpassung der userauth!
            //var identityResult = user.UpdateUserAuth(ApplicationUser, param, rolesOfUserGroup, UserManager, RoleManager);
            //return identityResult;
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
        #endregion
        
    }
}