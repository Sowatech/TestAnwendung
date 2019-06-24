using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Sowatech.TestAnwendung.Dom
{
    [Table("Categories")]
    public class Category : ObjectDefault
    {
        public static Category Create(IApplicationUser user, int clientId)
        {
            var result = new Category();
            result.Init(user, clientId);
            return result;
        }

        protected override void Init(IApplicationUser user, int? clientId)
        {
            base.Init(user, clientId);
        }

        [MaxLength(50)]
        virtual public string name { get; set; }
        virtual public int orderValue { get; set; }

        public interface IUpdateParam
        {
            string name { get; set; }
            int orderValue { get; set; }
        }

        public void Update(IApplicationUser user, IUpdateParam updateParam)
        {
            this.name = updateParam.name;
            this.orderValue = updateParam.orderValue;
            SetEdited(user);
        }
    }

}
