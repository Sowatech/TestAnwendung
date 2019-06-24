using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace leveso.leveso2.Dal.NavMenu
{
    public class NavItemsDto
    {
        public IEnumerable<NavItem> navItems { get; set; }
    }

    public class NavItem
    {
        public string text { get; set; }
        public string textKey { get; set; }
        public bool visible { get; set; }
        public string path { get; set; }
        public string iconClass {get;set;}
        public IEnumerable<NavItem> items { get; set; }
        public string[] visibleForRoles { get; set; }
        public bool collapsed { get; set; }
    }
}
