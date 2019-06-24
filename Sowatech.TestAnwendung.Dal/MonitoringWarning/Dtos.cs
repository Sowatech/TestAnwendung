using Sowatech.TestAnwendung.Dom;
using Sowatech.TestAnwendung.Dom.shared;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sowatech.TestAnwendung.Dal.MonitoringWarning
{

    public class MonitoringWarningDto
    {
        public bool warning { get; set; }
    }

    public class MonitoringSourceList
    {
        [Key]
        public string source { get; set; }
        public DateTimeOffset? lastError { get; set; }
        public DateTimeOffset? lastRecovered { get; set; }
        

        private static string ViewSql
        {
            get
            {
                return @"
				  SELECT 
                    MonitoringSource.source,
                    MonitoringSource.lastError,
                    MonitoringSource.lastRecovered
                    FROM MonitoringSources MonitoringSource
					";
            }
        }
    }
}