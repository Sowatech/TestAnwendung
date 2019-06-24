using Newtonsoft.Json;
using Sowatech.EventCommandSqlRemote.Events;
using Sowatech.Logging;
using System;
using System.ComponentModel.Composition;
using System.Net.Http;
using System.Text;

namespace Sowatech.TestAnwendung.Application.EventHandler.Extranet
{
    /// <summary>
    /// Markierungs Interface zur Kennzeichnung von Events die ans Extranet gesendet werden
    /// </summary>
    public interface IEventForExtranet { }

    [Export(typeof(IEventHandler)), PartCreationPolicy(CreationPolicy.NonShared)]
    public class SendEventsToExtranetEventHandler : ClassWithLogger, IEventHandler
    {
        [ImportingConstructor]
        public SendEventsToExtranetEventHandler()
        {
        }

        public string Name { get { return "SendEventsToExtranetEventHandler"; } }

        public void Handle(EventInfo eventInfo)
        {
            if (UrlIsConfigured() && EventTypeShouldBeSend(eventInfo))
            {
                PostEventToWeb(eventInfo);
            }
        }

        private static bool UrlIsConfigured()
        {
            return !string.IsNullOrWhiteSpace(Properties.Settings.Default.SendEventsToExtranetEventHandlerUrl);
        }

        private bool EventTypeShouldBeSend(EventInfo eventInfo)
        {
            return eventInfo.EventDto is IEventForExtranet;
        }

        private static void PostEventToWeb(EventInfo eventInfo)
        {
            var eventForExtranet = new EventForExtranet(eventInfo);
            var eventsForExtranet = new EventsForExtranet { ApiKey = Properties.Settings.Default.EventsCommandSecret, Events = new EventForExtranet[] { eventForExtranet } };
            var json = JsonConvert.SerializeObject(eventsForExtranet);
            using (var client = new HttpClient())
            {
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                var response = client.PostAsync(new Uri(Properties.Settings.Default.SendEventsToExtranetEventHandlerUrl), content).Result;
                response.EnsureSuccessStatusCode();
            }
        }
    }

    public class EventsForExtranet
    {
        public string ApiKey { get; set; }
        public EventForExtranet[] Events { get; set; }
    }

    public class EventForExtranet : EventInfo
    {
        public EventForExtranet(EventInfo info) : base(info.Id, info.Created, info.Creator, info.EventDto)
        {
            this.Type = info.EventDto.GetType().FullName;
        }

        public string Type { get; private set; }
    }
}