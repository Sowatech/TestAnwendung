using Sowatech.Dal.Repository;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;

namespace Sowatech.TestAnwendung.Dal.Repositories
{
    public class DbSetUserGroupsRepository : DbSetRepository<Dom.UserGroup, int>
    {
        public DbSetUserGroupsRepository(object lockObject, DbSet<Dom.UserGroup> dbSet) : base(lockObject, dbSet)
        {
        }

        
        public IEnumerable<Dom.UserGroup> GetSelectForClient(int clientId,bool includeAdministratorUserGroup = true)

        {
            return dbSet
                .Where(usergroup => 
                    usergroup.client_id == clientId ||
                    includeAdministratorUserGroup && usergroup.UserGroupType == Dom.UserGroup.UserGroupTypes.Administrator
                    )
                .OrderBy(usergroup => usergroup.name)
                .ToList();
        }

        public Dom.UserGroup GetClientAdministratorUserGroup()
        {
            return dbSet.Single(usergroup => usergroup.UserGroupType == Dom.UserGroup.UserGroupTypes.Administrator);
        }
    }
}
