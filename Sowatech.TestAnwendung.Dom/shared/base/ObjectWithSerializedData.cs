using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sowatech.TestAnwendung.Dom
{
    public abstract class ObjectWithSerializedData<T> : ObjectDefault where T : class
    {
        public ObjectWithSerializedData()
        {
            ConfigureJsonSerializer();
            SerializedIsInitialized = true;
        } 
        
        protected virtual void Init(IApplicationUser user, int clientId, T serializedObject = null)
        {
            base.Init(clientId);
            ConfigureJsonSerializer();
            this.InitSerialized(user, clientId, serializedObject);
        }

        #region Serialization Configuration and Initialization
        private JsonSerializerSettings SerializerSettings;
        private void ConfigureJsonSerializer()
        {
            SerializerSettings = new JsonSerializerSettings();
            SerializerSettings.TypeNameHandling = TypeNameHandling.All;
        }

        [NotMapped]
        protected bool SerializedIsInitialized = false;

        private void InitSerialized(IApplicationUser user, int clientId, T serializedObject)
        {
            T serializedInstance;
            if (serializedObject == null)
            {
                serializedInstance = this.CreateSerializedInstance(user, clientId);
            }
            else
            {
                serializedInstance = serializedObject;
            }
            this.Serialized = JsonConvert.SerializeObject(serializedInstance, this.SerializerSettings);
            SerializedIsInitialized = true;
        }
        #endregion
        
        public virtual string Serialized { get; set; }
        
        protected virtual T CreateSerializedInstance(IApplicationUser user, int clientId)
        {
            throw new NotImplementedException("Instanz des serialisierten Objekts muss beim Konstruktor übergeben oder in dieser abgeleiteten Methode erstellt werden");
        }

        private T _SerializedAsObject;
        [NotMapped]
        public T SerializedAsObject
        {
            get
            {
                if (_SerializedAsObject == null) this.Deserialize();
                return _SerializedAsObject;
            }
        }

        protected void Deserialize()
        {
            if (!SerializedIsInitialized) throw new InvalidOperationException("Cannot Deserialize Object before Initialization");
            _SerializedAsObject = JsonConvert.DeserializeObject<T>(this.Serialized, this.SerializerSettings);
        }

        protected virtual void Serialize()
        {
            this.Serialized = JsonConvert.SerializeObject(this.SerializedAsObject, this.SerializerSettings);
            _SerializedAsObject = default(T);
        }

        protected virtual void Serialize(T objectToSerialize)
        {
            this.Serialized = JsonConvert.SerializeObject(objectToSerialize, this.SerializerSettings);
            _SerializedAsObject = default(T);
        }
    }
}
