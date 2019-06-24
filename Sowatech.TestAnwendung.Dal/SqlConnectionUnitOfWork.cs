using Sowatech.EventCommandSqlRemote.Events;

namespace Sowatech.TestAnwendung.Dal
{
    public class SqlConnectionUnitOfWork : Sowatech.Dal.UnitOfWork.SqlConnectionUnitOfWork, IEventDispatcher
    {
        public SqlConnectionUnitOfWork(string connectionStringName) : base(connectionStringName)
        {
        }

        public void RaiseEvent(object eventDto)
        {
            if (eventStore == null) eventStore = new EventStore(Connection);
            lock (EventService.WriteEventsMutex)
            {
                eventStore.AddEvent(eventDto);
            }
        }

        private EventStore eventStore;
    }
}