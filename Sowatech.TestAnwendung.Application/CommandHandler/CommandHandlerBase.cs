using Sowatech.TestAnwendung.Dom;
using Sowatech.EventCommandSqlRemote.Events;
using Sowatech.ServiceLocation;
using System;

namespace Sowatech.TestAnwendung.Application.CommandHandler
{
    public abstract class CommandHandlerBase : Sowatech.EventCommandSqlRemote.Commands.CommandHandlerBase
    {
        public CommandHandlerBase(IServiceLocator serviceLocator, params Type[] commandTypes) : base(serviceLocator, commandTypes)
        {
            ApplicationUser = DummyUserFactory.CreateDummyUser(GetType().Name);
        }

        protected readonly IApplicationUser ApplicationUser;

        protected void SetEventDispatcher(IEventDispatcher eventDispatcher)
        {
            ObjectBase.Events = eventDispatcher;
        }
    }
}