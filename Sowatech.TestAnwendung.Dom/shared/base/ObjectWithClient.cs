using System;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;

namespace Sowatech.TestAnwendung.Dom
{
    public abstract class ObjectWithClient : ObjectBase, IObjectWithClient
    {
        protected virtual void Init(int? clientId)
        {
            this.client_id = clientId;
        }

        virtual public int? client_id { get; set; }
    }

    public interface IObjectWithClient
    {
        int? client_id { get; set; }
    }


}