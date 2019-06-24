using Sowatech.TestAnwendung.Dom;
using Sowatech.EventCommandSqlRemote.Events;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Sowatech.TestAnwendung.Dal
{
    public class Seeder
    {
        public Seeder(EntityFrameworkContext context, IEventDispatcher eventDispatcher)
        {
            this.context = context;
            this.Random = new Random(4711);
            ApplicationUser = new SeederUser();
            ApplicationUser.UserName = "seeder";
            ApplicationUser.displayName = "seeder";
            Seed();
            foreach (var ev in raisedEvents)
            {
                eventDispatcher.RaiseEvent(ev);
            }
        }
        private SeederUser ApplicationUser;
        class SeederUser : IApplicationUser
        {
            public DateTimeOffset? accessEnd { get; set; }
            public DateTimeOffset? accessStart { get; set; }
            public int? client_id { get; set; }
            public string displayName { get; set; }
            public string Email { get; set; }
            public string Id { get; set; }
            public IEnumerable<int> userGroupIds { get; set; }
            public string UserName { get; set; }
        }

        private Random Random;
        private EntityFrameworkContext context;
        private Dom.Client seedClient = null;

        private void Seed()
        {
            createClient();
        }

        private void createClient()
        {
            this.seedClient = Client.Create(ApplicationUser);
            this.seedClient.name = "Sowatech.TestAnwendung" + ".Client";
            context.Clients.Add(this.seedClient);
            context.SaveChanges();
        }

        private void createUserGroup(string name, IEnumerable<string> roleNames, int index)
        {
            context.UserGroups.Add(new Dom.UserGroup()
            {
                client_id = 1,
                id = index,
                name = name,
                userRoles = roleNames
            });
            context.SaveChanges();
        }

        public void RaiseEvent(object eventDto)
        {
            raisedEvents.Add(eventDto);
        }

        private List<object> raisedEvents = new List<object>();
    }
}