using Sowatech.eExam.Dom;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Sowatech.TestAnwendung.Dom;

namespace Sowatech.TestAnwendung.Dal.ClientAdministration
{
    public class ClientDto
    {
        public ClientDto(Dom.Client client)
        {
            this.from(client);
        }
        public int id { get; set; }
        public string name { get; set; }
        public string accessEnd { get; set; }//date iso
        public string accessStart { get; set; }//date iso

        public DateTimeOffset created { get; set; }
        public string createdBy { get; set; }
        public DateTimeOffset edited { get; set; }
        public string editedBy { get; set; }

        private void from(Dom.Client client)
        {
            id = client.id;
            name = client.name;
            accessEnd = ShortDateConverter.ConvertToIso(client.accessEnd);
            accessStart = ShortDateConverter.ConvertToIso(client.accessStart);

            created = client.created;
            createdBy = client.createdBy;
            edited= client.edited;
            editedBy = client.editedBy;
        }
    }

    public class EditClientDtoBase : Dom.Client.IUpdateParam
    {
        public string name { get; set; }
        public string accessEnd { get; set; }
        public string accessStart { get; set; }

        DateTimeOffset? Client.IUpdateParam.accessStart
        {
            get
            {
                return ShortDateConverter.ConvertToNullableDate(this.accessStart);
            }

            set
            {
                this.accessStart = ShortDateConverter.ConvertToIso(value.Value.Date);
            }
        }
        DateTimeOffset? Client.IUpdateParam.accessEnd
        {
            get
            {
                return ShortDateConverter.ConvertToNullableDate(this.accessEnd);
            }

            set
            {
                ShortDateConverter.ConvertToIso(value);
            }
        }
    }

    public class InsertClientDto : EditClientDtoBase,IApplicationUserAddParam
    {
        public string displayName { get; set; }
        public string email { get; set; }
        public string userName { get; set; }
        public string password { get; set; }
        public IEnumerable<int> userGroupIds { get; set; }

        DateTimeOffset? IApplicationUserUpdateParam.accessStart
        {
            get
            {
                return ShortDateConverter.ConvertToNullableDate(this.accessStart);
            }

            set
            {
                this.accessStart = ShortDateConverter.ConvertToIso(value.Value.Date);
            }
        }
        DateTimeOffset? IApplicationUserUpdateParam.accessEnd
        {
            get
            {
                return ShortDateConverter.ConvertToNullableDate(this.accessEnd);
            }

            set
            {
                ShortDateConverter.ConvertToIso(value);
            }
        }
    }

    public class UpdateClientDto : EditClientDtoBase
    {
        public UpdateClientDto(Dom.Client src=null)
        {
            if (src != null)
            {
                this.id = src.id;
                this.name = src.name;
                this.accessStart = ShortDateConverter.ConvertToIso(src.accessStart);
                this.accessEnd = ShortDateConverter.ConvertToIso(src.accessEnd);
            }
        }
        public int id { get; set; }
    }
}
