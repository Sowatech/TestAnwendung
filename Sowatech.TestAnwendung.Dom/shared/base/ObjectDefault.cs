using System;
using System.ComponentModel.DataAnnotations;

namespace Sowatech.TestAnwendung.Dom
{
    public abstract class ObjectDefault : ObjectWithIntId
    {
        protected override void Init(IApplicationUser user, int? clientId)
        {
            base.Init(user, clientId);
            this.created = Dom.DateTimeOffsetDom.Now;
            this.createdBy = user.UserName;
            this.SetEdited(user);
        }

        virtual public DateTimeOffset created { get; set; }

        [MaxLength(50)]
        virtual public string createdBy { get; set; }

        virtual public DateTimeOffset edited { get; set; }

        [MaxLength(50)]
        virtual public string editedBy { get; set; }

        protected virtual void SetEdited(IApplicationUser user)
        {
            this.edited = Dom.DateTimeOffsetDom.Now;
            this.editedBy = user.UserName;
        }
    }
}