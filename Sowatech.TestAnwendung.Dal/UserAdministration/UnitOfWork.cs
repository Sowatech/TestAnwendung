using Sowatech.TestAnwendung.Dal.Repositories;
using Sowatech.Dal.Repository;
using Sowatech.Dal.UnitOfWork;
using System.ComponentModel.Composition;

namespace Sowatech.TestAnwendung.Dal.UserAdministration
{
    [Export(typeof(UnitOfWork)), PartCreationPolicy(CreationPolicy.NonShared)]
    public class UnitOfWork : DbContextUnitOfWork<EntityFrameworkContext>
    {
        public UnitOfWork()
        {
            UserGroup = new DbSetUserGroupsRepository(Context, Context.UserGroups);
        }

        public override void Dispose()
        {
            base.Dispose();
        }

        public DbSetUserGroupsRepository UserGroup { get; private set; }
    }
}
