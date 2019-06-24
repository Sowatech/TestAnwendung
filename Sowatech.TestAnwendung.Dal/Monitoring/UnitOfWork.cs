using Sowatech.Dal.Repository;
using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using System.Data.SqlClient;
using System.Linq;

namespace Sowatech.TestAnwendung.Dal.Monitoring
{
    [Export(typeof(UnitOfWork)), PartCreationPolicy(CreationPolicy.NonShared)]
    public class UnitOfWork : DbContextUnitOfWork<EntityFrameworkContext>
    {
        public UnitOfWork()
        {
            ViewMonitoringSourceList = new ViewGetAllRepository<MonitoringSourceList>(Connection);
            ViewMonitoringLogList = new ViewGetByMonitoringSourceRepository(Connection);
        }

        public override void Dispose()
        {
        }
        public ViewGetAllRepository<MonitoringSourceList> ViewMonitoringSourceList { get; set; }
        public ViewGetByMonitoringSourceRepository ViewMonitoringLogList { get; set; }
    }

    public class ViewGetByMonitoringSourceRepository : ViewRepository<MonitoringLogList>
    {
        public ViewGetByMonitoringSourceRepository(SqlConnection connection) : base(connection)
        {
        }

        public IEnumerable<MonitoringLogList> GetByMonitoringSource(string source, DateTimeOffset? startDate, DateTimeOffset? endDate)
        {
            return queryable.Where(obj => obj.source == source&&(startDate.HasValue && obj.time>=startDate||!startDate.HasValue) && (endDate.HasValue && obj.time <= endDate||!endDate.HasValue)).ToList();
        }
    }
}