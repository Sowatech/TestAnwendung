using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sowatech.TestAnwendung.Dom
{
    /// <summary>
    /// Geographic location details according to WGS 84
    /// </summary>
    public class TGeographicLocation
    {
        public virtual decimal? longitude { get; set; }
        public virtual decimal? latitude { get; set; }

        public interface IUpdateParam
        {
            decimal? longitude { get; set; }
            decimal? latitude { get; set; }
        }

        public void Update(IUpdateParam param)
        {
            this.longitude = param.longitude;
            this.latitude = param.latitude;
        }

    }
}
