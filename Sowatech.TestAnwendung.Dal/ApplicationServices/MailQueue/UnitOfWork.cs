using Sowatech.TestAnwendung.Dom;
using Sowatech.Dal.Repository;
using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using System.Data.Entity;
using System.Linq;

namespace Sowatech.TestAnwendung.Dal.ApplicationServices.MailQueue
{
    [Export(typeof(UnitOfWork)), PartCreationPolicy(CreationPolicy.NonShared)]
    public class UnitOfWork : DbContextUnitOfWork<EntityFrameworkContext>
    {
        public UnitOfWork()
        {
            ClientSettingsDom = new DbSetGetAllRepository<Dom.ClientSettings, int>(Context, Context.ClientSettings);
            MailJobsDom = new DbSetMailJobRepository(Context, Context.MailJobs);
        }

        public DbSetGetAllRepository<Dom.ClientSettings, int> ClientSettingsDom { get; set; }
        public DbSetMailJobRepository MailJobsDom { get; set; }
        //TODO: FileRepository

        public override void Dispose()
        {
            base.Dispose();
        }
    }

    public class DbSetMailJobRepository : DbSetRepository<MailJob, int>
    {
        public DbSetMailJobRepository(object lockObject, DbSet<MailJob> dbSet) : base(lockObject, dbSet)
        {
        }

        public IEnumerable<MailJob> GetMailsForSending(int client_id)
        {
            return this.dbSet
                .Where(item => item.client_id == client_id && item.status <= MailJobStatus.Retry && item.nextRun <= DateTime.Now)
                .ToList();
        }
    }
}