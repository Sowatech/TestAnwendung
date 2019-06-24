using Sowatech.EventCommandSqlRemote.Events;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Transactions;

namespace Sowatech.TestAnwendung.Dal
{
    public class DbContextUnitOfWork<CONTEXT> : Sowatech.Dal.UnitOfWork.DbContextUnitOfWork<CONTEXT>, IEventDispatcher where CONTEXT : DbContext, new()
    {
        private EventStore _eventStore;

        private EventStore eventStore
        {
            get
            {
                if (_eventStore == null) _eventStore = new EventStore(Connection);
                return _eventStore;
            }
        }

        public override void SaveChanges()
        {
            Connection.Open();
            try
            {
                using (var transaction = new TransactionScope())
                {
                    base.SaveChanges();
                    if (raisedEvents.Count > 0)
                    {
                        lock (EventService.WriteEventsMutex)
                        {
                            foreach (var eventDto in raisedEvents)
                            {
                                eventStore.AddEvent(eventDto);
                            }
                            transaction.Complete();
                            raisedEvents.Clear();
                        }
                    }
                    else
                    {
                        transaction.Complete();
                    }
                }
            }
            finally
            {
                Connection.Close();
            }
        }

        public void RaiseEvent(object eventDto)
        {
            if (disposed) throw new ObjectDisposedException(this.GetType().FullName);
            raisedEvents.Add(eventDto);
        }

        private List<object> raisedEvents = new List<object>();

        private bool disposed = false;

        public override void Dispose()
        {
            disposed = true;
            base.Dispose();
        }
    }
}