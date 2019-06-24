using System.ComponentModel.Composition;
using System.Web.Http;

namespace Sowatech.TestAnwendung.Application.Controllers
{
    [Export(typeof(MobileTestController)), PartCreationPolicy(CreationPolicy.NonShared)]
    public class MobileTestController : ApiController
    {
        public MobileTestController()
        {
        }

        [HttpGet]
        public string Test()
        {
            return "mobile test";
        }

    }
}