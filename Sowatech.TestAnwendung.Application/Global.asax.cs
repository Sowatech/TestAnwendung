using Sowatech.TestAnwendung.Dom;
using Newtonsoft.Json;
using Sowatech.EventCommandSqlRemote.Commands;
using Sowatech.EventCommandSqlRemote.Events;
using Sowatech.Logging;
using Sowatech.WebApi;
using System;
using System.Linq;
using System.Text;
using System.Web.Http;
using System.Web.Optimization;

namespace Sowatech.TestAnwendung.Application
{
    public class WebApiApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            GlobalConfiguration.Configure(WebApiConfig.Register);
            globalResolver = WebApiConfig.dependencyResolver.CreateScope();
            logger = globalResolver.ServiceLocator.GetAllInstances<ILogger>().Single().Value;
            BundleConfig.RegisterBundles(BundleTable.Bundles);
            Dal.EntityFrameworkContext.UpdateDb();

            monitoring = globalResolver.ServiceLocator.GetAllInstances<IMonitoring>().Single().Value;

            //Startet den EventService der Subcriber mit Events versorgt
            //StartEventService();
            //StartCommandService();

            //Startet zwei Hintergrunddienste die in Endlosschleife in einem eigenen Hintergrundthread ausgeführt werden.
            //globalResolver.ServiceLocator.GetAllInstances<Service1>().Single().Value.Start();
            //globalResolver.ServiceLocator.GetAllInstances<Service2>().Single().Value.Start();
        }

        private static void StartEventService()
        {
            var eventService = globalResolver.ServiceLocator.GetAllInstances<EventService>().Single().Value;
            Dom.ObjectBase.Events = eventService;
            foreach (var eventHandler in globalResolver.ServiceLocator.GetAllInstances<IEventHandler>().Select(h => h.Value))
            {
                eventService.Subscribe(eventHandler.Name, eventHandler.Handle);
            }
            eventService.OnError += EventService_OnError;
            eventService.OnSuccess += EventService_OnSuccess;
            eventService.Start();
        }

        private static void EventService_OnSuccess(EventInfo eventInfo, string subscription)
        {
            monitoring.Recovered(subscription, true);
        }

        private static void EventService_OnError(Exception exception, EventInfo eventInfo, string subscription)
        {
            StringBuilder message = new StringBuilder();
            UnrollException(message, exception);
            monitoring.ErrorOccured(subscription, message.ToString(), eventInfo.Id.ToString());
        }

        private static IMonitoring monitoring;

        private static void StartCommandService()
        {
            var commandService = globalResolver.ServiceLocator.GetAllInstances<CommandService>().Single().Value;
            foreach (var commandHandler in globalResolver.ServiceLocator.GetAllInstances<ICommandHandler>().Select(h => h.Value))
            {
                foreach (var type in commandHandler.CommandTypes)
                {
                    commandService.Subscribe(type, commandHandler.Handle);
                }
            }
            commandService.OnError += CommandService_OnError;
            commandService.OnSuccess += CommandService_OnSuccess;
            commandService.Start();
        }

        private static void CommandService_OnSuccess(CommandInfo eventInfo, string commandHandlerName)
        {
            monitoring.Recovered(commandHandlerName, true);
        }

        private static void CommandService_OnError(Exception exception, CommandInfo commandInfo, string commandHandlerName)
        {
            StringBuilder message = new StringBuilder();
            UnrollException(message, exception);
            monitoring.ErrorOccured(commandHandlerName, message.ToString(), JsonConvert.SerializeObject(commandInfo));
        }

        private static void UnrollException(StringBuilder message, Exception ex)
        {
            message.AppendLine(ex.Message);
            //message.AppendLine(ex.StackTrace);
            if (ex.InnerException != null) UnrollException(message, ex.InnerException);
            if (ex is AggregateException)
            {
                foreach (var inner in ((AggregateException)ex).InnerExceptions) UnrollException(message, inner);
            }
        }

        public static MefDependencyResolver globalResolver;
        public static ILogger logger;

        private void Application_Error(object sender, EventArgs e)
        {
            Exception exc = Server.GetLastError();

            logger.Error(exc, "Application_Error");

            if (System.Diagnostics.Debugger.IsAttached)
                System.Diagnostics.Debugger.Break();
        }
    }
}