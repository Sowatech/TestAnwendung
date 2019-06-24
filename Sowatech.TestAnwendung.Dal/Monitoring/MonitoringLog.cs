using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Sowatech.TestAnwendung.Dal.Monitoring
{
    [Table("MonitoringLogs")]
    public class MonitoringLog
    {
        public int Id { get; set; }

        public string message { get; set; }

        public DateTimeOffset time { get; set; }
        public string context { get; set; }
        public TMonitoringLogTypes type { get; set; }
    }

    public enum TMonitoringLogTypes { Info = 0, Error = 1, Recovered = 2 };
}