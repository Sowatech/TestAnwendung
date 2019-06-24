using System;
using Sowatech.EventCommandSqlRemote.Events;
using System.ComponentModel.DataAnnotations.Schema;

namespace Sowatech.TestAnwendung.Dom
{
    public interface IObjectDeletable
    {
        void Delete(IApplicationUser user);
    }

    public abstract class ObjectBase : IObjectDeletable
    {
        [NotMapped]
        public bool deleted { get; set; }

        public virtual void Delete(IApplicationUser user)
        {
            if (this.deleted) throw new InvalidOperationException("Call of Delete for already deleted Object");
            this.deleted = true;
        }

        [ThreadStatic]
        public static IEventDispatcher Events;

        public void RaiseEvent(object eventObjectDto)
        {
            if (Events!=null)
            {
                ObjectBase.Events.RaiseEvent(eventObjectDto);
            }
        }
    }
}