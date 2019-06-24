using System;

namespace Sowatech.TestAnwendung.Dom
{
    public interface IMonitoring
    {
        /// <summary>
        /// Call this if an error occured that should be monitored
        /// </summary>
        /// <param name="source">MAXLENGTH 150! An ident of the source of the error (e.g. eventhandler)</param>
        /// <param name="message">MAXLENGTH 150! A message to display in the monitoring view</param>
        /// <param name="context">Optional context information (e.g. the event)</param>
        /// <param name="time">Optional time (if null current time is used)</param>
        void ErrorOccured(string source, string message, string context = null, DateTimeOffset? time = null);

        /// <summary>
        /// Call this if the system has recovered from an error
        /// </summary>
        /// <param name="source">MAXLENGTH 150! An ident of the source of the error (e.g. eventhandler)</param>
        /// <param name="noLog">true if no log entry should be generated</param>
        /// <param name="context">
        /// Optional context information (e.g. the event). Could be the same as in a preceding
        /// ErrorOccured call was used.
        /// </param>
        /// <param name="time">Optional time (if null current time is used)</param>
        void Recovered(string source, bool noLog, string context = null, DateTimeOffset? time = null);

        /// <summary>
        /// Call this to log important information to the monitoring view
        /// </summary>
        /// <param name="source">MAXLENGTH 150! An ident of the source of the error (e.g. eventhandler)</param>
        /// <param name="message">MAXLENGTH 150! A message to display in the monitoring view</param>
        /// <param name="time">Optional time (if null current time is used)</param>
        void Info(string source, string message, DateTimeOffset? time = null);
    }
}