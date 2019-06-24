using Sowatech.Dal.Repository;
using Sowatech.Dal.UnitOfWork;
using System;
using System.ComponentModel.Composition;

namespace Sowatech.TestAnwendung.Dal.MasterData
{
    [Export(typeof(UnitOfWork)), PartCreationPolicy(CreationPolicy.NonShared)]
    public class UnitOfWork : DbContextUnitOfWork<EntityFrameworkContext>
    {
        public UnitOfWork()
        {
            //Liste = new ViewGetAllClientRepository<CategoriesReadDto>(Connection);
            CategoryEdit = new DbSetEditableRepository<Dom.Category, int>(Context, Context.Category);
        }

        public override void Dispose()
        {
            //(Liste as IDisposable).Dispose();
            base.Dispose();
        }

        //public ViewGetAllClientRepository<CategoriesReadDto> Liste { get; private set; }
        public DbSetEditableRepository<Dom.Category, int> CategoryEdit { get; set; }
    }
}

