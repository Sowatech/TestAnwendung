using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Sowatech.TestAnwendung.Dom
{
    [ComplexType]
    public class TPerson : TPerson.IUpdateParam
    {
        public TPerson()
        {
            this.gender = GenderType.male;
        }

        [MaxLength(50)]
        public virtual string firstName { get; set; }

        [MaxLength(50)]
        public virtual string lastName { get; set; }

        public virtual GenderType gender { get; set; }

        [DataType(DataType.Date)]
        public virtual DateTimeOffset? birthday { get; set; }

        public TPerson Clone()
        {
            var result = new TPerson();
            result.Update(this);
            return result;
        }

        public interface IUpdateParam
        {
            string firstName { get; set; }
            string lastName { get; set; }
            GenderType gender { get; set; }
            DateTimeOffset? birthday { get; set; }
        }

        public void Update(IUpdateParam param)
        {
            firstName = param.firstName;
            lastName = param.lastName;
            gender = param.gender;
            birthday = param.birthday;
        }

        public void Clear()
        {
            this.firstName = "";
            this.lastName = "";
            this.gender = GenderType.unknown;
            this.birthday = null;
        }
    }

    public enum GenderType { unknown = 0, female = 1, male = 2, other = 3 }

    public static class TPersonFactory
    {

        private static Random rnd = new Random(4711);
        private static string[] maleNames = { "Hans", "Werner", "Klaus", "Tom", "Christian", "Thomas", "Christian", "Paul", "Andreas", "Dirk", "Alfons" };
        private static string[] femaleNames = { "Hermine", "Wibke", "Karin", "Tatjana", "Christine", "Anna", "Berta", "Katharina", "Anita", "Magda" };
        private static string[] lastNames = { "Müller", "Meier", "König", "Mann", "Maus", "Herzog", "Kaiser", "Weber", "Schmidt", "Schmitt", "Albrecht", "Arend", "Bruckmann", "Caspar", "Drucker", "Eltmann", "Friedrich" };

        public static TPerson CreateRandom()
        {
            var mygender = (GenderType)rnd.Next(2) + 1;
            var ageInDays = (rnd.Next(30) + 20) * 365 + rnd.Next(365);
            var result = new TPerson
            {
                gender = mygender,
                firstName = mygender == GenderType.male ? maleNames[rnd.Next(maleNames.Length)] : femaleNames[rnd.Next(femaleNames.Length)],
                lastName = lastNames[rnd.Next(lastNames.Length)],
                birthday = DateTime.Today.AddDays(-ageInDays)
            };

            return result;
        }

    }
}