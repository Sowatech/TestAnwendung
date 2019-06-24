using Sowatech.TestAnwendung.Dom;
using Sowatech.ServiceLocation;

namespace Sowatech.TestAnwendung.Application.EventHandler
{
    public abstract class EventHandlerBase : Sowatech.EventCommandSqlRemote.Events.EventHandlerBase
    {
        public EventHandlerBase(IServiceLocator serviceLocator, string name) : base(serviceLocator, name)
        {
            ApplicationUser = DummyUserFactory.CreateDummyUser(name);
        }

        protected readonly IApplicationUser ApplicationUser;
    }
}