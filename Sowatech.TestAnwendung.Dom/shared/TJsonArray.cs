using Newtonsoft.Json;
using System;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Runtime.Serialization;

namespace Sowatech.TestAnwendung.Dom.shared
{
    [ComplexType]
    public class TJsonArrayBase
    {
        public virtual string json { get; set; }
    }

    /// <summary>
    /// EF erlaubt keine generischen Klassen als ComplexTypes.
    /// zur Umgehung im Anwendungsfall einfach nicht-generisch von der generischen Klasse TJsonArray<T> ableiten, z.b. so:
    /// [ComplexType]
    /// public class participationProcedureTypesJsonArray : TJsonArray<participationProcedureType> { };
    /// </summary>
    /// <typeparam name="T"></typeparam>
    public class TJsonArray<T> : TJsonArrayBase
    {
        public TJsonArray(){}

        public TJsonArray(TypeNameHandling typeNameHandling=TypeNameHandling.None)
        {
            if(typeNameHandling!= TypeNameHandling.None)
            {
                serializerSettings = new JsonSerializerSettings();
                serializerSettings.TypeNameHandling = typeNameHandling;// TypeNameHandling.All;
            }
        }
        private JsonSerializerSettings serializerSettings;

        [NotMapped]
        public T[] data
        {
            get
            {
                if (_data == null)
                {
                    Deserialize();
                }
                return _data;
            }
            set
            {
                this._data = value;
                Serialize();
            }
        }

        [NotMapped]
        private T[] _data { get; set; }

        public virtual void Clear()
        {
            this.data = new T[] { };
        }

        public virtual void Add(T item)
        {
            var list = this.data.ToList();
            list.Add(item);
            this.data = list.ToArray();
        }

        public virtual bool IsEmpty()
        {
            return this.data.Length == 0;;
        }

        protected virtual void Deserialize()
        {
            _data = Deserialize(this.json,this.serializerSettings);
        }
        
        public virtual void Serialize()
        {
            json = Serialize(data,this.serializerSettings);
        }

        public static T[] Deserialize(string json, JsonSerializerSettings serializerSettings=null)
        {
            if (string.IsNullOrEmpty(json))
            {
                return new T[] { };
            }
            else
            {
                return serializerSettings != null ? JsonConvert.DeserializeObject<T[]>(json,serializerSettings) : JsonConvert.DeserializeObject<T[]>(json);
            }
        }

        public static string Serialize(T[] data, JsonSerializerSettings serializerSettings=null)
        {
            return serializerSettings!=null ? JsonConvert.SerializeObject(data, serializerSettings) : JsonConvert.SerializeObject(data);
        }
    }
}
