using System;
using System.ComponentModel.DataAnnotations;
using System.Linq;

namespace Sowatech.TestAnwendung.Dom
{
    public abstract class ObjectWithIntId : ObjectWithClient
    {
        
        protected virtual void Init(IApplicationUser user, int? clientId)
        {
            base.Init(clientId);
        }

        [Key]
        virtual public int id { get; set; }

        [Newtonsoft.Json.JsonIgnore]
        virtual public bool IsNew{get { return this.id <= 0; }}
    }
}