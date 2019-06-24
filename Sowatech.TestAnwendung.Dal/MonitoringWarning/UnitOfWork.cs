using Sowatech.Dal.Repository;
using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using System.Data.SqlClient;
using System.Linq;

namespace Sowatech.TestAnwendung.Dal.MonitoringWarning
{
    [Export(typeof(UnitOfWork)), PartCreationPolicy(CreationPolicy.NonShared)]
    public class UnitOfWork : DbContextUnitOfWork<EntityFrameworkContext>
    {
        public UnitOfWork()
        {
            ViewMonitoringWarning = new ViewMonitoringWarningRepository(Connection);
        }

        public override void Dispose()
        {
        }
        public ViewMonitoringWarningRepository ViewMonitoringWarning { get; set; }
        
    }

    public class ViewMonitoringWarningRepository : ViewRepository<MonitoringSourceList>
    {
        public ViewMonitoringWarningRepository(SqlConnection connection) : base(connection)
        {
        }

        public bool Get()
        {
            return queryable.Where(obj => obj.lastError > obj.lastRecovered).Any();
        }
    }
}