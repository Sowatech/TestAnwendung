using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sowatech.TestAnwendung.Dal.shared
{
    /// <summary>
    /// Dto to use as a basic alternative instead of the direct use of the much more detailed Microsoft.AspNet.Identity.IdentityResult
    /// </summary>
    public class IdentityResultDto
    {
        public IdentityResultDto(bool succeeded,IEnumerable<string> errors=null)
        {
            this.Succeeded = succeeded;
            this.Errors = errors != null ? errors.ToArray():new string[0];
        }
        public bool Succeeded { get; set; }
        public string[] Errors { get; set; }
    }
}
