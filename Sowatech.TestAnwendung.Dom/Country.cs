using System.ComponentModel.DataAnnotations;

namespace Sowatech.TestAnwendung.Dom
{
    public class Country
    {
        public static Country Create(IApplicationUser user)
        {
            var result = new Country();
            return result;
        }

        [MaxLength(2), Required, Key]
        public virtual string iso2 { get; set; }

        [MaxLength(100), Required]
        public virtual string name { get; set; }
    }

    public class State
    {
        public static State Create(IApplicationUser user)
        {
            var result = new State();
            return result;
        }

        [MaxLength(10), Required, Key]
        public virtual string iso { get; set; }

        [MaxLength(2), Required]
        public virtual string countryIso2 { get; set; }

        [MaxLength(100), Required]
        public virtual string name { get; set; }
    }
}
