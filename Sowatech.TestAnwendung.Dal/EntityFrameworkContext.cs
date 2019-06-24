using Sowatech.TestAnwendung.Dal.Monitoring;
using Sowatech.TestAnwendung.Dom;
using Sowatech.EventCommandSqlRemote.Commands;
using Sowatech.EventCommandSqlRemote.Events;
using Sowatech.Logging;
using System.Data.Entity;
using System.Linq;

namespace Sowatech.TestAnwendung.Dal
{
    public class EntityFrameworkContext : DbContext
    {
        public EntityFrameworkContext()
            : base("Sowatech.TestAnwendung.Dal.ConnectionString")
        {
        }

        public static void UpdateDb()
        {
            using (EntityFrameworkContext context = new EntityFrameworkContext())
            using (var eventService = new EventService(null, new NoLogger()))
            {
                context.Database.Initialize(false);
                if (!context.Clients.Any())
                {
                    new Seeder(context, eventService);
                    context.SaveChanges();
                }
            }
        }

        public override int SaveChanges()
        {
            if (!OmitDeletes) DeleteAllMarkedAsDeleted();
            return base.SaveChanges();
        }

        #region Delete Flag Handling
        public bool OmitDeletes = false;

        // aufruf bsp.: DeleteOrphaned<Notiz>(a => a.standortAkquise == null);
        //private void DeleteOrphaned<T>(Func<T, bool> predicate) where T : class
        //{
        //    Set<T>().RemoveRange(Set<T>().Local.Where(e => predicate(e)).ToList());
        //}

        private void DeleteAllMarkedAsDeleted()
        {
            var allEntityTypes = this.GetType().GetProperties()
                .Where(property => HasGenericDbSetType(property))
                .Select(dbSetType => GetEntityTypeOfDbSet(dbSetType)).ToArray();
            var allDbSets = allEntityTypes.Select(entityType => Set(entityType)).ToArray();
            foreach (var set in allDbSets)
            {
                var deletedEntities = set.Local.OfType<ObjectBase>().Where(e => e.deleted).ToList();
                if (deletedEntities.Count != 0)
                {
                    set.RemoveRange(deletedEntities);
                }
            }
        }

        private static bool HasGenericDbSetType(System.Reflection.PropertyInfo p)
        {
            return p.PropertyType.IsGenericType && p.PropertyType.GetGenericTypeDefinition().Equals(typeof(DbSet<>));
        }

        private static System.Type GetEntityTypeOfDbSet(System.Reflection.PropertyInfo p)
        {
            return p.PropertyType.GetGenericArguments()[0];
        }

        #endregion

        public DbSet<Event> Events { get; set; }
        public DbSet<Subscription> Subscriptions { get; set; }
        public DbSet<Command> Commands { get; set; }
        public DbSet<MonitoringSource> MonitoringSources { get; set; }

        public DbSet<Dom.MailJob> MailJobs { get; set; }

        public DbSet<Dom.RefreshToken> RefreshTokens { get; set; }
		public DbSet<Dom.Client> Clients { get; set; }
        public DbSet<Dom.ClientSettings> ClientSettings { get; set; }
        public DbSet<Dom.SystemSettings> SystemSettings { get; set; }
        public DbSet<Dom.Category> Category { get; set; }
        public DbSet<Dom.UserGroup> UserGroups { get; set; }
        public DbSet<Dom.UserLog> UserLogs { get; set; }
    }
}