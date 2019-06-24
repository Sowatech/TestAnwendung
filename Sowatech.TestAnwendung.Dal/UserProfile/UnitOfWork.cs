using Sowatech.TestAnwendung.Dal.Repositories;
using Sowatech.Dal.UnitOfWork;
using System.ComponentModel.Composition;

namespace Sowatech.TestAnwendung.Dal.UserProfile
{
    [Export(typeof(UnitOfWork)), PartCreationPolicy(CreationPolicy.NonShared)]
    public class UnitOfWork : DbContextUnitOfWork<EntityFrameworkContext>
    {
        public UnitOfWork()
        {
            ClientSettings = new DbSetClientSettingsRepository(Context, Context.ClientSettings);
        }

        public override void Dispose()
        {
            base.Dispose();
        }
        
        public DbSetClientSettingsRepository ClientSettings { get; private set; }
    }
}
