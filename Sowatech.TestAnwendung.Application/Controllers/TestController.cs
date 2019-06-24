using Sowatech.EventCommandSqlRemote.Events;
using Sowatech.WebApi;
using System;
using System.ComponentModel.Composition;
using System.Web.Http;

namespace Sowatech.TestAnwendung.Application.Controllers
{
    [Export(typeof(TestController)), PartCreationPolicy(CreationPolicy.NonShared)]
    [UnhandledExceptionFilter]
    [AllowAnonymous]
    public class TestController : ControllerBase
    {
        [ImportingConstructor]
        public TestController(IEventDispatcher eventDispatcher)
        {
            this.eventDispatcher = eventDispatcher;
        }

        private IEventDispatcher eventDispatcher;

        public class TestClass
        {
            public int number { get; set; }
            public string text { get; set; }
        }

        [HttpPost]
        public int GetTestNumber(TestClass param)
        {
            Random rnd = new Random();
            return rnd.Next();
        }

        //[HttpGet]
        //public void SendEvent()
        //{
        //    eventDispatcher.RaiseEvent(new MyEvent
        //    {
        //        Name = "Hallo",
        //        Created = DateTime.Now
        //    });
        //}

        //public class MyEvent { public string Name { get; set; } public DateTime Created { get; set; } }

        //[HttpGet]
        //public MyEvent[] GetEvents()
        //{
        //    return Sowatech.TestAnwendung.Application.EventHandler.EventHandler.handledEvents.OfType<MyEvent>().ToArray();
        //}
    }
}