using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Sowatech.TestAnwendung.Dom
{
    [ComplexType]
    public class TAddress : TAddress.IUpdateParam
    {
        [MaxLength(50)]
        public virtual string adressGeneral { get; set; }

        [MaxLength(50)]
        public virtual string streetName { get; set; }

        [MaxLength(10)]
        public virtual string streetNumber { get; set; }

        [MaxLength(10)]
        public virtual string postalCode { get; set; }

        [MaxLength(10)]
        public virtual string poBox { get; set; }

        [MaxLength(50)]
        public virtual string town { get; set; }

        [MaxLength(50)]
        public virtual string townSection { get; set; }

        [MaxLength(50)]
        public virtual string county { get; set; }

        [MaxLength(2)]
        public virtual string countryIso2 { get; set; }//DE, AT..

        [MaxLength(10)]
        public virtual string stateIso { get; set; }//DE-BW, DE-BY

        public TAddress Clone()
        {
            var result = new TAddress();
            result.Update(this);
            return result;
        }

        public interface IUpdateParam
        {
            string adressGeneral { get; set; }
            string streetName { get; set; }
            string streetNumber { get; set; }
            string postalCode { get; set; }
            string poBox { get; set; }
            string town { get; set; }
            string townSection { get; set; }
            string county { get; set; }
            string countryIso2 { get; set; }//DE, AT..
            string stateIso { get; set; }//DE-BW, DE-BY
        }

        public void Update(IUpdateParam param)
        {
            adressGeneral = param.adressGeneral;
            streetName = param.streetName;
            streetNumber = param.streetNumber;
            postalCode = param.postalCode;
            poBox = param.poBox;
            town = param.town;
            townSection = param.townSection;
            county = param.county;
            countryIso2 = param.countryIso2;
            var isValidBundeslandOfLand = !string.IsNullOrEmpty(param.stateIso) && param.stateIso.StartsWith(countryIso2);
            stateIso = isValidBundeslandOfLand ? param.stateIso : "";
        }

        public void Clear()
        {
            this.adressGeneral = "";
            this.streetName = "";
            this.streetNumber = "";
            this.postalCode = "";
            this.poBox = "";
            this.town = "";
            this.townSection = "";
            this.county = "";
            this.countryIso2 = "";
            this.stateIso = "";
        }
    }

    public static class TAddressFactory{

        private static Random rnd = new Random(4711);
        static string[] streets = { "Waldweg", "An der Flur", "Hauptstraße", "Neuer Ring", "Baumstraße", "Forstweg", "Himmelberg", "Stadtweg", "Am Fluß", "Industriestraße", "Hochpfad", "Bachstraße", "Hauspfad", "Leinenweg", "Bergstraße", "Talweg", "Am Platz" };
        static string[] towns = { "Musterstadt", "Oberdorf", "Unterdorf", "Neustadt", "Althausen", "Mettingen", "Hausen", "Tallenberg", "Orten", "Memhof", "Aalingen", "Brassen", "Gerlingen" };
        static string[] states = { "DE-NW", "DE-RP", "DE-BY" };
        static string[] townSections = { "Innenstadt", "Vorstadt", "Oberstadt", "Industriegebiet" };
        static string[] counties = { "Musterkreis", "Vorstadt", "Oberstadt", "Industriegebiet" };

        public static TAddress CreateRandom()
        {
            var hasAdressGeneral = rnd.Next(100) < 10;
            var hasPoBox = rnd.Next(100) < 5;
            var hasTownSection = rnd.Next(100) < 10;

            var adresse = new TAddress
            {
                streetName = streets[rnd.Next(streets.Length - 1)],
                town = towns[rnd.Next(towns.Length - 1)],
                postalCode = (10000 + rnd.Next(88888)).ToString(),
                countryIso2 = "DE",
                streetNumber = (rnd.Next(99) + 1).ToString(),
                adressGeneral = hasAdressGeneral ? (rnd.Next(9) + 1).ToString() + ".Etage" : "",
                stateIso = states[rnd.Next(3)],
                poBox = hasPoBox ? "PF " + (rnd.Next(99) + 1).ToString() + " " + (rnd.Next(99) + 1).ToString() : "",
                townSection = hasTownSection ? townSections[rnd.Next(townSections.Length - 1)] : ""
            };

            return adresse;
        }

    }

}