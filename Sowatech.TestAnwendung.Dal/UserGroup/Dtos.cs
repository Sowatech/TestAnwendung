using Sowatech.TestAnwendung.Dom;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace Sowatech.TestAnwendung.Dal.UserGroup
{
    public class UserGroupDto : ObjectWithIntId
    {
        public System.String name { get; set; }
        public System.String comment { get; set; }
        public System.String rolesCommaList { get; set; }

        private static string ViewSql
        {
            get
            {
                return @"
                    SELECT
                    UserGroup.id,
                    UserGroup.client_id,
                    UserGroup.name,
                    UserGroup.comment,
                    UserGroup.rolesCommaList
                    FROM UserGroup UserGroup
                    ";
            }
        }
    }

    public class EditUserGroupDtoBase : Dom.UserGroup.IUpdateParam
    {
        public EditUserGroupDtoBase()
        {
            userRoles = new string[0];
        }
        public string name { get; set; }
        public string comment { get; set; }
        public string[] userRoles { get; set; }
    }

    public class AddUserGroupDto: EditUserGroupDtoBase
    {
        public int client_id { get; set; }
    }

    public class UpdateUserGroupDto : EditUserGroupDtoBase
    {
        public UpdateUserGroupDto(Dom.UserGroup src)
        {
            if (src != null)
            {
                this.id = src.id;
                this.name = src.name;
                this.comment = src.comment;
                this.name = src.name;
                this.userRoles = src.userRoles.ToArray();
            }

        }
        public int id { get; set; }
    }
}