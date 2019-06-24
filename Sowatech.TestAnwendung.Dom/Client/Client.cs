using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sowatech.TestAnwendung.Dom
{
    [Table("Clients")]
    public class Client
    {
        public static Client Create(IApplicationUser user)
        {
            var result = new Client();
            result.Init(user);
            return result;
        }

        protected virtual void Init(IApplicationUser user)
        {
            this.created = DateTimeOffset.Now;
            this.createdBy = user.UserName;
            this.SetEdited(user);
        }

        [Key]
        virtual public int id { get; set; }
        public int client_id
        {
            get
            {
                return this.id;
            }
            set
            {
                //readonly
            }
        }

        [MaxLength(100),Required]
        public virtual string name { get; set; }
        public virtual DateTimeOffset? accessStart { get; set; }
        public virtual DateTimeOffset? accessEnd { get; set; }


        virtual public DateTimeOffset created { get; set; }
        [MaxLength(50)]
        virtual public string createdBy { get; set; }

        virtual public DateTimeOffset edited { get; set; }

        [MaxLength(50)]
        virtual public string editedBy { get; set; }

        protected virtual void SetEdited(IApplicationUser user)
        {
            this.edited = DateTimeOffset.Now;
            this.editedBy = user.UserName;
        }

        public interface IUpdateParam
        {
            string name { get; set; }
            DateTimeOffset? accessStart { get; set; }
            DateTimeOffset? accessEnd { get; set; }
        }

        public void Update(IApplicationUser user, IUpdateParam dto)
        {
            this.name = dto.name;
            accessStart = dto.accessStart;
            accessEnd = dto.accessEnd;
            SetEdited(user);
        }
        
    }
}
