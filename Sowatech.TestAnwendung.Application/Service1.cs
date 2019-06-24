using Sowatech.ServiceLocation;
using Sowatech.Threading;
using System.ComponentModel.Composition;

namespace Sowatech.TestAnwendung.Application
{
    /// <summary>
    /// Beispiel für einen Service. Startet mit Start() einen Hintergrundthread, der bei Dispose() wieder gestoppt wird. Der Thread füht endlos die Methode ServiceLoop aus.
    /// Uows sollten nicht direkt injiziert werden, da man sonst ggf. Wochenlang mit dem gleichen EF Context arbeitet (der zumüllt und veraltete Daten enthält).
    /// Besser ServiceLocator injiziren lassen und bei Bedarf immer ein frisches Uow holen und wieder disposen.
    /// </summary>
    [Export(typeof(Service1)), PartCreationPolicy(CreationPolicy.NonShared)]
    public class Service1 : Service
    {
        [ImportingConstructor]
        public Service1(IServiceLocator serviceLocator)
        {
            this.serviceLocator = serviceLocator;
        }

        private IServiceLocator serviceLocator;

        /// <summary>
        /// Wird defaultmäßig alle 10ms ausgeführt. Exceptions werden gecatcht und geloggt. Bei Exception folgt eine Pause von 1s.
        /// </summary>
        protected override void ServiceLoop()
        {
            //using (var unitOfWork = serviceLocator.GetAllInstances<Whatever>().Single().Value)
            //{
            //}
        }

        /// <summary>
        /// Die Pauser nach jeder Ausführung kann überschrieben werden (hier mit 60s). Hier kann man natürlich auch Settings auslesen um es konfigurierbar zu machen.
        /// </summary>
        //protected override int PauseTimeImMs
        //{
        //    get
        //    {
        //        return 60000;
        //        //return Properties.Settings.Default.ScheduledTasksControllerPauseTimeImMs;
        //    }
        //}

        /// <summary>
        /// Ebenso kann die Pause bei Fehler überschrieben werden.
        /// </summary>
        //protected override int ErrorPauseTimeInSeconds
        //{
        //    get
        //    {
        //        return 10;
        //    }
        //}
    }
}