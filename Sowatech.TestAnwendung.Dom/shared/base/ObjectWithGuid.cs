using System;
using System.ComponentModel.DataAnnotations;
using System.Linq;

namespace Sowatech.TestAnwendung.Dom
{
    public abstract class ObjectWithGuid : ObjectWithClient
    {
        protected override void Init(int? clientId)
        {
            this.client_id = clientId;
        }
        
        [Key]
        virtual public Guid id { get; set; }
    }
}