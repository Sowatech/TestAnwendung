using Sowatech.TestAnwendung.Dom;
using Sowatech.Logging;
using System;
using System.ComponentModel.Composition;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;

namespace Sowatech.TestAnwendung.Dal.Monitoring
{
    [Export(typeof(IMonitoring)), PartCreationPolicy(CreationPolicy.Shared)]
    public class Monitoring : ClassWithLogger, IMonitoring
    {
        public Monitoring()
        {
            this.connection = new SqlConnection(ConfigurationManager.ConnectionStrings["RMS.FachtrainerDatenbank.Dal.ConnectionString"].ConnectionString);

            this.insertSource = new SqlCommand("INSERT INTO [MonitoringSources] (source) VALUES (@source)", this.connection);
            this.insertSource.Parameters.Add("@source", SqlDbType.NVarChar, 150);

            this.updateSourceError = new SqlCommand("UPDATE [MonitoringSources] SET lastError = @time,lastMessage = @message WHERE source = @source", this.connection);
            this.updateSourceError.Parameters.Add("@source", SqlDbType.NVarChar, 150);
            this.updateSourceError.Parameters.Add("@time", SqlDbType.DateTimeOffset);
            this.updateSourceError.Parameters.Add("@message", SqlDbType.NVarChar);

            this.updateSourceRecovered = new SqlCommand("UPDATE [MonitoringSources] SET lastRecovered = @time WHERE source = @source", this.connection);
            this.updateSourceRecovered.Parameters.Add("@source", SqlDbType.NVarChar, 150);
            this.updateSourceRecovered.Parameters.Add("@time", SqlDbType.DateTimeOffset);

            this.updateSourceInfo = new SqlCommand("UPDATE [MonitoringSources] SET lastInfo = @time,lastMessage = @message WHERE source = @source", this.connection);
            this.updateSourceInfo.Parameters.Add("@source", SqlDbType.NVarChar, 150);
            this.updateSourceInfo.Parameters.Add("@time", SqlDbType.DateTimeOffset);
            this.updateSourceInfo.Parameters.Add("@message", SqlDbType.NVarChar);

            this.insertLogError = new SqlCommand("INSERT INTO [MonitoringLogs] (message,time,context,MonitoringSource_source,type) VALUES (@message,@time,@context,@source,1)", connection);
            this.insertLogError.Parameters.Add("@source", SqlDbType.NVarChar, 150);
            this.insertLogError.Parameters.Add("@time", SqlDbType.DateTimeOffset);
            this.insertLogError.Parameters.Add("@message", SqlDbType.NVarChar);
            this.insertLogError.Parameters.Add("@context", SqlDbType.NVarChar);

            this.insertLogRecovered = new SqlCommand("INSERT INTO [MonitoringLogs] (time,context,MonitoringSource_source,type) VALUES (@time,@context,@source,2)", connection);
            this.insertLogRecovered.Parameters.Add("@source", SqlDbType.NVarChar, 150);
            this.insertLogRecovered.Parameters.Add("@time", SqlDbType.DateTimeOffset);
            this.insertLogRecovered.Parameters.Add("@context", SqlDbType.NVarChar);

            this.insertLogInfo = new SqlCommand("INSERT INTO [MonitoringLogs] (message,time,context,MonitoringSource_source,type) VALUES (@message,@time,@source,0)", connection);
            this.insertLogInfo.Parameters.Add("@source", SqlDbType.NVarChar, 150);
            this.insertLogInfo.Parameters.Add("@time", SqlDbType.DateTimeOffset);
            this.insertLogInfo.Parameters.Add("@message", SqlDbType.NVarChar);
        }

        private SqlConnection connection;
        private SqlCommand insertSource;
        private SqlCommand updateSourceError;
        private SqlCommand updateSourceRecovered;
        private SqlCommand updateSourceInfo;
        private SqlCommand insertLogError;
        private SqlCommand insertLogRecovered;
        private SqlCommand insertLogInfo;

        public void ErrorOccured(string source, string message, string context = null, DateTimeOffset? time = null)
        {
            try
            {
                try
                {
                    this.connection.Open();

                    this.updateSourceError.Parameters[0].Value = source;
                    this.updateSourceError.Parameters[1].Value = time.GetValueOrDefault(DateTimeOffset.Now);
                    this.updateSourceError.Parameters[2].Value = message;

                    CreateOrUpdateSource(source, this.updateSourceError);

                    this.insertLogError.Parameters[0].Value = source;
                    this.insertLogError.Parameters[1].Value = time.GetValueOrDefault(DateTimeOffset.Now);
                    this.insertLogError.Parameters[2].Value = message;
                    this.insertLogError.Parameters[3].Value = context;
                    this.insertLogError.ExecuteNonQuery();
                }
                finally
                {
                    this.connection.Close();
                }
            }
            catch (Exception ex)
            {
                Logger.Error(ex, "{0}.ErrorOccured", GetType().FullName);
            }
        }

        private void CreateOrUpdateSource(string source, SqlCommand command)
        {
            if (command.ExecuteNonQuery() == 0)
            {
                this.insertSource.Parameters[0].Value = source;
                this.insertSource.ExecuteNonQuery();
                command.ExecuteNonQuery();
            }
        }

        public void Info(string source, string message, DateTimeOffset? time = null)
        {
            try
            {
                try
                {
                    this.connection.Open();

                    this.updateSourceInfo.Parameters[0].Value = source;
                    this.updateSourceInfo.Parameters[1].Value = time.GetValueOrDefault(DateTimeOffset.Now);
                    this.updateSourceInfo.Parameters[2].Value = message;

                    CreateOrUpdateSource(source, this.updateSourceError);

                    this.insertLogInfo.Parameters[0].Value = source;
                    this.insertLogInfo.Parameters[1].Value = time.GetValueOrDefault(DateTimeOffset.Now);
                    this.insertLogInfo.Parameters[2].Value = message;
                    this.insertLogInfo.ExecuteNonQuery();
                }
                finally
                {
                    this.connection.Close();
                }
            }
            catch (Exception ex)
            {
                Logger.Error(ex, "{0}.ErrorOccured", GetType().FullName);
            }
        }

        public void Recovered(string source, bool noLog, string context = null, DateTimeOffset? time = null)
        {
            try
            {
                try
                {
                    this.connection.Open();

                    this.updateSourceRecovered.Parameters[0].Value = source;
                    this.updateSourceRecovered.Parameters[1].Value = time.GetValueOrDefault(DateTimeOffset.Now);

                    CreateOrUpdateSource(source, this.updateSourceRecovered);

                    if (!noLog)
                    {
                        this.insertLogRecovered.Parameters[0].Value = source;
                        this.insertLogRecovered.Parameters[1].Value = time.GetValueOrDefault(DateTimeOffset.Now);
                        this.insertLogRecovered.Parameters[2].Value = context;
                        this.insertLogRecovered.ExecuteNonQuery();
                    }
                }
                finally
                {
                    this.connection.Close();
                }
            }
            catch (Exception ex)
            {
                Logger.Error(ex, "{0}.ErrorOccured", GetType().FullName);
            }
        }
    }
}