using Sowatech.TestAnwendung.Application.Models;
using Sowatech.TestAnwendung.Dom;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;
using Sowatech.EventCommandSqlRemote.Events;
using Sowatech.Logging;
using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using System.Linq;
using System.Net.Http;
using System.Security;
using System.Threading;
using System.Web.Http;

namespace Sowatech.TestAnwendung.Application.Controllers
{
    public abstract class ControllerBase : ApiController, IClassWithLogger
    {
        public const string RoleNameSystemAdministrator = "SystemAdministrator";
        public const string RoleNameAdministrator = "Administrator";
        public const string RoleNameUser = "User";
        public static readonly string[] NonAdminRoleNames = { RoleNameUser };

        [Import(AllowDefault = true)]
        public virtual Sowatech.Logging.ILogger Logger { get; set; }

        private ApplicationUserManager _userManager;

        protected ApplicationUserManager UserManager
        {
            get
            {
                return _userManager ?? Request.GetOwinContext().GetUserManager<ApplicationUserManager>();
            }
            private set
            {
                _userManager = value;
            }
        }

        private ApplicationRoleManager _roleManager;

        public ApplicationRoleManager RoleManager
        {
            get
            {
                return _roleManager ?? Request.GetOwinContext().GetUserManager<ApplicationRoleManager>();
            }
            private set
            {
                _roleManager = value;
            }
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                if (_userManager != null)
                {
                    _userManager.Dispose();
                    _userManager = null;
                }
            }

            base.Dispose(disposing);
        }

        protected string CurrentTan
        {
            get
            {
                return User.Identity.Name;
            }
        }

        private int? TanClientId = null;
        protected void SetTanAsApplicationUser(int tanClientId)
        {
            this.TanClientId = tanClientId;
            this.applicationUser = new ApplicationUser();
            this.ApplicationUser.displayName = CurrentTan;
            this.ApplicationUser.client_id = tanClientId;
        }

        private ApplicationUser applicationUser;

        protected ApplicationUser ApplicationUser
        {
            get
            {
                if (applicationUser == null)
                {
                    applicationUser = UserManager.FindById(User.Identity.GetUserId()) ?? ApplicationUser.Null;
                }
                return applicationUser;
            }
        }

        protected bool IsInRole(string userId, string role)
        {
            try
            {
                return UserManager.IsInRole(userId, role);
            }
            catch
            {
                return false;
            }
        }

        private bool? applicationUserIsSystemAdministrator = null;
        protected bool ApplicationUserIsSystemAdministrator
        {
            get
            {
                if (!applicationUserIsSystemAdministrator.HasValue)
                {
                    applicationUserIsSystemAdministrator = ApplicationUser != ApplicationUser.Null && IsInRole(ApplicationUser.Id, RoleNameSystemAdministrator);
                }
                return applicationUserIsSystemAdministrator.Value;

            }
        }

        private bool? applicationUserIsAdministrator = null;
        protected bool ApplicationUserIsAdministrator
        {
            get
            {
                if (!applicationUserIsAdministrator.HasValue)
                {
                    applicationUserIsAdministrator = ApplicationUser != ApplicationUser.Null && IsInRole(ApplicationUser.Id, RoleNameAdministrator);
                }
                return applicationUserIsAdministrator.Value;
            }
        }

        protected int ApplicationUserClient_Id
        {
            get
            {
                return ApplicationUser.client_id.GetValueOrDefault(-1);
            }
        }

        protected IEnumerable<T> AssertAccessRights<T>(IEnumerable<T> list) where T : IObjectWithClient
        {
            return list.Where(item => HasAccess(item.client_id)).ToList();
        }

        protected IEnumerable<Client> AssertAccessRights(IEnumerable<Client> list)
        {
            return list.Where(item => HasAccess(item.client_id)).ToList();
        }

        protected T AssertAccessRights<T>(T obj) where T : ObjectWithClient
        {
            AssertAccessRights((int?)obj.client_id);
            return obj;
        }

        protected Client AssertAccessRights(Client obj)
        {
            AssertAccessRights((int?)obj.client_id);
            return obj;
        }

        protected void AssertAccessRights(int clientId)
        {
            bool hasAccess = HasAccess(clientId);
            if (!hasAccess) throw new SecurityException("User has no access on client");
        }

        protected void AssertAccessRights(int? clientId)
        {
            bool hasAccess = HasAccess(clientId);
            if (!hasAccess) throw new SecurityException("User has no access on client");
        }

        private bool HasAccess(int? clientId)
        {
            var superAccess = ApplicationUserIsSystemAdministrator;
            var clientAccess = clientId == ApplicationUser.client_id.GetValueOrDefault(-1);
            var hasAccess = superAccess || clientAccess;
            return hasAccess;
        }

        protected void SetEventDispatcher(IEventDispatcher eventDispatcher)
        {
            ObjectBase.Events = eventDispatcher;
        }

        protected bool WaitUntilAllEventsProcessedBy(IEventRegistry eventRegistry, string subscriptionName, TimeSpan timeout)
        {
            var timeoutTime = DateTime.Now.Add(timeout);
            var latestEventId = eventRegistry.GetLatestEventId();
            while (eventRegistry.GetCurrentEventId(subscriptionName) < latestEventId)
            {
                if (DateTime.Now >= timeoutTime) return false;
                Thread.Sleep(100);
            }
            return true;
        }
    }
}