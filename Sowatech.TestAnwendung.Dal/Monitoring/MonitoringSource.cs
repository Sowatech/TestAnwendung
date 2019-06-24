using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Sowatech.TestAnwendung.Dal.Monitoring
{
    [Table("MonitoringSources")]
    public class MonitoringSource
    {
        [Key, MaxLength(150)]
        public string source { get; set; }

        public string lastMessage { get; set; }

        public DateTimeOffset? lastError { get; set; }
        public DateTimeOffset? lastRecovered { get; set; }
        public DateTimeOffset? lastInfo { get; set; }

        public ICollection<MonitoringLog> logs { get; set; }
    }
}