using Sowatech.TestAnwendung.Dal.MasterData;
using Sowatech.TestAnwendung.Dom;
using Sowatech.WebApi;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using System.Web.Http;

namespace Sowatech.TestAnwendung.Application.Controllers
{

    [Export(typeof(MasterDataController)), PartCreationPolicy(CreationPolicy.NonShared)]
    [UnhandledExceptionFilter]
    [Authorize]
    public class MasterDataController : ControllerBase
    {
        [ImportingConstructor]
        public MasterDataController(UnitOfWork uow)
        {
            this.uow = uow;
        }

        private UnitOfWork uow;

        [HttpGet]
        public IEnumerable<Category> getListCategory()
        {
            List<Category> dummies = new List<Category>();
            for (int i = 0; i < 20; i++)
            {
                var cat = Category.Create(ApplicationUser, ApplicationUserClient_Id);
                cat.id = i;
                cat.name = "dummy-" + i.ToString();
                cat.orderValue = i + 1;
                dummies.Add(cat);
            }
            return dummies;
        }

        public class CategoryDto : Category.IUpdateParam
        {
            public int id { get; set; }
            public string name { get; set; }
            public int orderValue { get; set; }
        }

        [HttpPost]
        public void UpdateCategory(CategoryDto param)
        {
            var categoryDom = AssertAccessRights(uow.CategoryEdit.Get(param.id));
            categoryDom.Update(ApplicationUser, param);
            uow.SaveChanges();
        }

        [HttpGet]
        public void DeleteCategory(int id)
        {
            Logger.Debug("{0}.DeleteCategory", GetType().FullName);
            var categoryDom = AssertAccessRights(uow.CategoryEdit.Get(id));
            uow.CategoryEdit.Delete(id);
        }

        [HttpPost]
        public int InsertCategory(CategoryDto param)
        {
            Logger.Debug("{0}.InsertCategory", GetType().FullName);
            var newCategory = Category.Create(ApplicationUser, ApplicationUserClient_Id);
            newCategory.Update(ApplicationUser, param);
            uow.CategoryEdit.Add(newCategory);

            uow.SaveChanges();
            return newCategory.id;
        }


    }
}