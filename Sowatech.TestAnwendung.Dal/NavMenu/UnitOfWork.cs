using leveso.leveso2.Dal.Repositories;
using System.ComponentModel.Composition;
using System.Linq;

namespace leveso.leveso2.Dal.NavMenu
{
    [Export(typeof(UnitOfWork)), PartCreationPolicy(CreationPolicy.NonShared)]
    public class UnitOfWork : DbContextUnitOfWork<EntityFrameworkContext>
    {

        [ImportingConstructor]
        public UnitOfWork(Sowatech.ServiceLocation.IServiceLocator serviceLocator)
        {
            FileRepository = serviceLocator.GetAllInstances<IFileRepository>(Settings.Default.FileRepositoryType).Single().Value;
            FileRepository.Init(Settings.Default.FileRepositoryConnectionstring);
        }

        public override void Dispose()
        {
            FileRepository.Dispose();
            base.Dispose();
        }

        public IFileRepository FileRepository { get; set; }
    }
}
