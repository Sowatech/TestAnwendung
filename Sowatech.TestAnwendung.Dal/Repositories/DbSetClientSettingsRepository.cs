using Sowatech.TestAnwendung.Dom;
using Sowatech.Dal.Repository;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;

namespace Sowatech.TestAnwendung.Dal.Repositories
{
    public class DbSetClientSettingsRepository : DbSetEditableRepository<Dom.ClientSettings, int>
    {
        public DbSetClientSettingsRepository(object lockObject, DbSet<Dom.ClientSettings> dbSet) : base(lockObject, dbSet)
        {
        }

        public Dom.ClientSettings GetByClientId(IApplicationUser user, int clientId)
        {
            if (clientId <= 0) throw new KeyNotFoundException("Ungültige Client Id: " + clientId.ToString());
            lock (lockObject)
            {
                var result = dbSet.SingleOrDefault(obj => obj.client_id == clientId);
                if (result == null)
                {
                    result = Dom.ClientSettings.Create(user,clientId);
                }
                return result;
            }
        }
    }
}
