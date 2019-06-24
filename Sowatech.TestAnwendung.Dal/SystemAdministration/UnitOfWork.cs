using Sowatech.TestAnwendung.Dal.Repositories;
using Sowatech.Dal.UnitOfWork;
using System.ComponentModel.Composition;

namespace Sowatech.TestAnwendung.Dal.SystemAdministration
{

    [Export(typeof(UnitOfWork)), PartCreationPolicy(CreationPolicy.NonShared)]
    public class UnitOfWork : DbContextUnitOfWork<EntityFrameworkContext>
    {
        public UnitOfWork()
        {
            SystemSettings = new DbSetSystemSettingsRepository(Context, Context.SystemSettings);
        }

        public override void Dispose()
        {
            base.Dispose();
        }

        public DbSetSystemSettingsRepository SystemSettings { get; private set; }
    }
}
