using Sowatech.TestAnwendung.Dom;
using Sowatech.Dal.Repository;
using Sowatech.eExam.Dom;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;

namespace Sowatech.TestAnwendung.Dal
{
    public class DbSetGetAllRepository<T, KEY> : DbSetRepository<T, KEY>
        where T : class

    {
        public DbSetGetAllRepository(object lockObject, DbSet<T> dbSet) : base(lockObject, dbSet)
        {
        }

        public IEnumerable<T> Get()
        {
            lock (lockObject)
            {
                return dbSet.ToList();
            }
        }
    }
}