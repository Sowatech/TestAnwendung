using Sowatech.TestAnwendung.Dom;
using Sowatech.eExam.Dom;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sowatech.TestAnwendung.Dal.UserAdministration
{
    public class UserDto: Dom.ObjectWithClient
    {
        public UserDto(IApplicationUser src, IEnumerable<Dom.UserGroup> userGroups)
        {
            if (src != null)
            {
                userName = src.UserName;
                displayName = src.displayName;
                email = src.Email;
                userGroupNames = string.Join(", ", src.userGroupIds.Select(ugid => GetUserGroupName(userGroups, ugid)));
                accessEnd = ShortDateConverter.ConvertToIso(src.accessEnd);
                accessStart = ShortDateConverter.ConvertToIso(src.accessStart);
            }
        }

        public string userName { get; set; }
        public string displayName { get; set; }
        public string email { get; set; }
        public string userGroupNames { get; set; }
        public string accessStart { get; set; }
        public string accessEnd { get; set; }

        private string GetUserGroupName(IEnumerable<Dom.UserGroup> userGroups, int? userGroupId)
        {
            var userGroup = userGroups!=null ? userGroups.FirstOrDefault(ug => ug.id == userGroupId):null;
            return userGroup != null ? userGroup.name : "";
        }
    }
    
    public class UpdateUserParams: Dom.ObjectWithClient,IApplicationUserUpdateParam,IApplicationUserAuthParam
    {
        public string displayName { get; set; }
        public string email { get; set; }
        public IEnumerable<int> userGroupIds { get; set; }
        public string accessStart { get; set; }
        public string accessEnd { get; set; }
        public string userName { get; set; }//in update readonly

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

    public class AddUserParams : UpdateUserParams,IApplicationUserAddParam
    {
        //public string userName { get; set; }//in add editable
        public string password { get; set; }
    }

    public interface IUserDtoWithAuthorizeSelectItems
    {
        SelectItem[] userGroupSelectItems { get; set; }
    }

    public class UpdateUserDto : UpdateUserParams, IUserDtoWithAuthorizeSelectItems
    {
        public UpdateUserDto(IApplicationUser src=null, SelectItem[] selectItems=null)
        {
            if (src != null) {
                userName = src.UserName;
                displayName = src.displayName;
                email = src.Email;
                userGroupIds = src.userGroupIds;
                accessEnd = ShortDateConverter.ConvertToIso(src.accessEnd);
                accessStart = ShortDateConverter.ConvertToIso(src.accessStart);
            }
            if (selectItems == null)
            {
                this.userGroupSelectItems = new SelectItem[0];
            }
            else
            {
                this.userGroupSelectItems = selectItems;
            }
        }
        
        public SelectItem[] userGroupSelectItems { get; set; }
    }

    public class AddUserDto : AddUserParams, IUserDtoWithAuthorizeSelectItems
    {
        public AddUserDto(int? clientId, SelectItem[] selectItems = null)
        {
            this.client_id = clientId;
            if (selectItems == null)
            {
                this.userGroupSelectItems = new SelectItem[0];
            }
            else
            {
                this.userGroupSelectItems = selectItems;
            }
        }

        public SelectItem[] userGroupSelectItems { get; set; }
    }

    public class SetPasswordParams
    {
        public string userName { get; set; }
        public string password { get; set; }
    }

    //----------------------------------------------------
    
    public class UserGroupDto: Dom.ObjectWithClient
    {
        public UserGroupDto(Dom.UserGroup src){
            if (src!=null)
            {
                this.id = src.id;
                this.client_id = src.client_id;
                this.name = src.name;
                this.roles = src.userRoles.ToArray();
            }
        }
        public System.Int32 id { get; set; }
        public System.String name { get; set; }
        public string[] roles { get; set; }
    }
}
