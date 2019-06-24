using Sowatech.TestAnwendung.Dal.Repositories;
using Sowatech.Dal.Repository;
using Sowatech.Dal.UnitOfWork;
using System.ComponentModel.Composition;
using System.Data.Entity;

namespace Sowatech.TestAnwendung.Dal.ClientAdministration
{
    [Export(typeof(UnitOfWork)), PartCreationPolicy(CreationPolicy.NonShared)]
    public class UnitOfWork : DbContextUnitOfWork<EntityFrameworkContext>
    {
        public UnitOfWork()
        {
            Liste = new DbSetGetAllRepository<Dom.Client, int>(Context, Context.Clients);
            Client = new DbSetEditableRepository<Dom.Client, int>(Context, Context.Clients);
            UserGroup = new DbSetClientAdminUserGroupsRepository(Context, Context.UserGroups);
        }

        public override void Dispose()
        {
            base.Dispose();
        }

        public DbSetGetAllRepository<Dom.Client, int> Liste { get; private set; }
        public DbSetEditableRepository<Dom.Client, int> Client { get; private set; }
        public DbSetClientAdminUserGroupsRepository UserGroup { get; private set; }
    }


    public class DbSetClientAdminUserGroupsRepository : DbSetUserGroupsRepository
    {
        public DbSetClientAdminUserGroupsRepository(object lockObject, DbSet<Dom.UserGroup> dbSet) : base(lockObject, dbSet)
        {

        }

        public void Add(Dom.UserGroup userGroup)
        {
            this.dbSet.Add(userGroup);
        }
    }
}
