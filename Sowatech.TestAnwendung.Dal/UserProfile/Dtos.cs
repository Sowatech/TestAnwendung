using Sowatech.TestAnwendung.Dom;

namespace Sowatech.TestAnwendung.Dal.UserProfile
{

    public class UpdateUserProfileDto : IApplicationUserProfileUpdateParam
    {
        public UpdateUserProfileDto(IApplicationUser src)
        {
            if (src != null)
            {
                this.displayName = src.displayName;
                this.email = src.Email;
            }
        }
        public string displayName { get; set; }
        public string email { get; set; }
    }

}
