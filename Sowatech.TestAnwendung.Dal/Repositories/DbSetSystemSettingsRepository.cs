using Sowatech.TestAnwendung.Dom;
using Sowatech.Dal.Repository;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sowatech.TestAnwendung.Dal.Repositories
{
    public class DbSetSystemSettingsRepository : DbSetRepository<Dom.SystemSettings, int>
    {
        public DbSetSystemSettingsRepository(object lockObject, DbSet<Dom.SystemSettings> dbSet) : base(lockObject, dbSet)
        {
        }

        public void Add(Dom.SystemSettings newEntity)
        {
            if (dbSet.Count() > 0) throw new InvalidOperationException("Dom.SystemSettings already exists");

            lock (lockObject)
            {
                dbSet.Add(newEntity);
            }
        }

        public Dom.SystemSettings Get(IApplicationUser user)
        {
            var result = dbSet.SingleOrDefault();
            if (result == null)
            {
                result = Dom.SystemSettings.Create(user);
            }
            return result;

        }

    }
}
