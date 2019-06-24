using Sowatech.Dal.UnitOfWork;
using Sowatech.Dal.Repository;
using Sowatech.UnitOfWork;
using System.ComponentModel.Composition;
using System;
using System.Linq;
using Sowatech.TestAnwendung.Dal;
using System.Data.Entity.Core.Objects;
using Sowatech.TestAnwendung.Dal.Repositories;
using System.Data.Entity;
using System.Collections.Generic;

namespace Sowatech.TestAnwendung.Dal.UserGroup
{
    [Export(typeof(UnitOfWork)), PartCreationPolicy(CreationPolicy.NonShared)]
    public class UnitOfWork : DbContextUnitOfWork<EntityFrameworkContext>
    {
        public UnitOfWork()
        {
            Liste = new ViewGetAllClientRepository<UserGroupDto>(Connection);
            UserGroupDom = new DbSetUserGroupRepository(Context, Context.UserGroups);
        }

        public override void Dispose()
        {
            (Liste as IDisposable).Dispose();
            base.Dispose();
        }
        
        public ViewGetAllClientRepository<UserGroupDto> Liste { get; private set; }
        public DbSetUserGroupRepository UserGroupDom { get; private set; }
    }

    public class DbSetUserGroupRepository : DbSetEditableRepository<Dom.UserGroup, int>
    {
        public DbSetUserGroupRepository(object lockObject, DbSet<Dom.UserGroup> dbSet) : base(lockObject, dbSet)
        { }

        public IEnumerable<Dom.UserGroup> GetAll(int clientId)
        {
            return this.dbSet.Where(ug => ug.client_id == clientId).ToList();
        }
    }
}
