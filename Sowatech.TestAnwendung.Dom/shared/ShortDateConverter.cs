using Newtonsoft.Json;
using System;
using System.Globalization;
using System.Linq;

namespace Sowatech.TestAnwendung.Dom
{
    //http://stackoverflow.com/questions/21914674/deserialize-only-date-part-of-datetime-in-web-api-2
    /// <summary>
    /// this converter is to be used when communicating Date without Time to the client and back
    /// Get: convert the the date as ISO string (ConvertToIso method)
    /// Update: convert the updated ISO string back to date (ConvertToDate method)
    /// </summary>
    public class ShortDateConverter : JsonConverter
    {
        public override bool CanConvert(Type objectType)
        {
            return objectType == typeof(DateTime);
        }

        public override object ReadJson(Newtonsoft.Json.JsonReader reader, Type objectType, object existingValue, Newtonsoft.Json.JsonSerializer serializer)
        {
            return DateTime.ParseExact((string)reader.Value, "yyyy-MM-dd", CultureInfo.InvariantCulture);
        }

        public override void WriteJson(Newtonsoft.Json.JsonWriter writer, object value, Newtonsoft.Json.JsonSerializer serializer)
        {
            DateTime d = (DateTime)value;
            writer.WriteValue(d.ToString("yyyy-MM-dd"));
        }

        //--
        public static string ConvertToIso(DateTime date)
        {
            return date.ToString("yyyy-MM-dd");
        }

        public static string ConvertToIso(DateTimeOffset date)
        {
            return date.ToString("yyyy-MM-dd");
        }

        public static string ConvertToIso(DateTime? date)
        {
            return date.HasValue ? ConvertToIso(date.Value) : null;
        }

        public static string ConvertToIso(DateTimeOffset? date)
        {
            return date.HasValue ? ConvertToIso(date.Value) : null;
        }

        public static DateTime ConvertToDate(string iso)
        {
            return DateTime.ParseExact(iso, "yyyy-MM-dd", CultureInfo.InvariantCulture);
        }

        public static DateTime? ConvertToNullableDate(string iso)
        {
            return string.IsNullOrEmpty(iso) ? (DateTime?)null : ConvertToDate(iso);
        }
    }
}