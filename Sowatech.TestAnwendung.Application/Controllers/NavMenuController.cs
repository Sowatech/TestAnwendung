using leveso.leveso2.Dal.NavMenu;
using Newtonsoft.Json;
using Sowatech.WebApi;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using System.IO;
using System.Text;
using System.Web.Hosting;
using System.Web.Http;

namespace leveso.leveso2.Application.Controllers
{
    [Export(typeof(NavMenuController)), PartCreationPolicy(CreationPolicy.NonShared)]
    [UnhandledExceptionFilter]
    public class NavMenuController : ControllerBase
    {
        [ImportingConstructor]
        public NavMenuController(UnitOfWork uow)
        {
            this.uow = uow;
            SetEventDispatcher(uow);
        }

        private UnitOfWork uow;

        [HttpGet]
        public NavItemsDto GetNavMenu()
        {
            Logger.Info("{0}.GetNavMenu", GetType().FullName);
            var dto = new NavItemsDto();
            var fileName = "Navigation/nav-data.static.json";
            var fileData = uow.FileRepository.Load(fileName);
            dto.navItems = JsonConvert.DeserializeObject<IEnumerable<NavItem>>(GetDataAsString(fileData));
            return dto;
        }

        private string GetDataAsString(byte[] data)
        {
            return Encoding.UTF8.GetString(data);
        }
    }
}