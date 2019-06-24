using Sowatech.TestAnwendung.Dom;
using Sowatech.Dal.Repository;
using Sowatech.eExam.Dom;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;

namespace Sowatech.TestAnwendung.Dal
{
    public class DbSetGetAllClientRepository<T, KEY> : DbSetRepository<T, KEY>
        where T : ObjectWithIntId

    {
        public DbSetGetAllClientRepository(object lockObject, DbSet<T> dbSet) : base(lockObject, dbSet)

        {
        }

        public IEnumerable<T> Get(int client_Id)
        {
            lock (lockObject)
            {
                return dbSet.Where(obj => obj.client_id == client_Id).ToList();
            }
        }
    }
}