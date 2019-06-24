using Sowatech.TestAnwendung.Dom;
using Sowatech.TestAnwendung.Dom.shared;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sowatech.TestAnwendung.Dal.Monitoring
{

    public class MonitoringSourceList
    {
        [Key]
        public string source { get; set; }
        public string lastMessage { get; set; }

        public DateTimeOffset? lastError { get; set; }
        public DateTimeOffset? lastRecovered { get; set; }
        public DateTimeOffset? lastInfo { get; set; }

        private static string ViewSql
        {
            get
            {
                return @"
				  SELECT 
                    MonitoringSource.source,
                    MonitoringSource.lastMessage,
                    MonitoringSource.lastError,
                    MonitoringSource.lastRecovered,
                    MonitoringSource.lastInfo
                    FROM MonitoringSources MonitoringSource
					";
            }
        }
    }

    public class MonitoringLogDetail
    {
        public IEnumerable<MonitoringLogList> logs { get; set; }
    }

    public class MonitoringLogList
    {
        [Key]
        public int Id { get; set; }
        public string message { get; set; }
        public DateTimeOffset time { get; set; }
        public string context { get; set; }
        public string source { get; set; }
        public TMonitoringLogTypes type { get; set; }

        private static string ViewSql
        {
            get
            {
                return @"
			 SELECT 
                    MonitoringLog.Id,
                    MonitoringLog.message,
                    MonitoringLog.time,
                    MonitoringLog.context,
                    MonitoringLog.MonitoringSource_source as source,
                    MonitoringLog.type
                    FROM MonitoringLogs MonitoringLog
					";
            }
        }
    }
}
