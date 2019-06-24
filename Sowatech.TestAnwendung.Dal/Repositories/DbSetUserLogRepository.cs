using Sowatech.Dal.Repository;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;

namespace Sowatech.TestAnwendung.Dal.Repositories
{
    public class DbSetUserLogRepository : DbSetRepository<Dom.UserLog, int>
    {
        public DbSetUserLogRepository(object lockObject, DbSet<Dom.UserLog> dbSet) : base(lockObject, dbSet)
        {
        }
        
        public IEnumerable<Dom.UserLog> GetLogsForUser(string userName)
        {
            return dbSet
                .Where(ul => ul.userName == userName)
                .OrderByDescending(ul => ul.created)
                .ToList();
        }
        
    }
}
