//using RMS.FachtrainerDatenbank.Dom.Events;
//using Sowatech.ServiceLocation;
//using System.Collections.Generic;
//using System.ComponentModel.Composition;

//namespace RMS.FachtrainerDatenbank.Application.EventHandler
//{
//    [Export(typeof(IEventHandler)), PartCreationPolicy(CreationPolicy.Shared)]
//    public class EventHandler : IEventHandler
//    {
//        [ImportingConstructor]
//        public EventHandler(IServiceLocator serviceLocator)
//        {
//            this.serviceLocator = serviceLocator;
//        }

// private IServiceLocator serviceLocator;

// public string Name => "EventHandler";

// public void Handle(EventInfo eventInfo) { //using (var unitOfWork =
// serviceLocator.GetAllInstances<Whatever>().Single().Value) //{ // if (eventInfo.EventDto is
// MyEvent) // { // DoSomething(unitOfWork, ((MyEvent)eventInfo.EventDto)); // } //}
// handledEvents.Add(eventInfo.EventDto); }

//        public static List<object> handledEvents = new List<object>();
//    }
//}