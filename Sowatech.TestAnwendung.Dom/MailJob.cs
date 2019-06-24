using Sowatech.TestAnwendung.Dom.shared;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Net.Mail;

namespace Sowatech.TestAnwendung.Dom
{
    [Table("MailJobs")]
    public class MailJob : ObjectDefault
    {
        public const int MAX_NUM_OF_RETRYS = 4;

        public static MailJob Create(IApplicationUser user, int clientId, ICreateParam param)
        {
            var result = new MailJob();

            result.Init(user, clientId, param);
            return result;
        }

        protected void Init(IApplicationUser user, int? clientId, ICreateParam param)
        {
            base.Init(user, clientId);
            this.to = new MailAddressArray();
            this.cc = new MailAddressArray();
            this.bcc = new MailAddressArray();
            this.replyTo = new MailAddressArray();

            this.to.data = param.to.ToArray();
            this.cc.data = param.cc?.ToArray();
            this.bcc.data = param.bcc?.ToArray();
            this.replyTo.data = param.replyTo?.ToArray();

            this.body = param.body;
            this.subject = param.subject;
            this.priority = param.priority;

            this.attachments = new MailJobAttachmentArray();
            foreach (IMailJobAttachment attachment in param.attachments)
            {
                this.attachments.Add(new MailJobAttachment(attachment));
            }

            this.sendEarliest = param.sendEarliest;
            this.sendLatest = param.sendLatest;

            this.SetNextRun(user, this.sendEarliest ?? DateTime.Now);
        }

        public interface ICreateParam
        {
            string body { get; set; }
            string subject { get; set; }
            MailPriority priority { get; set; }
            IMailJobAttachment[] attachments { get; set; }
            IEnumerable<string> to { get; set; }
            IEnumerable<string> cc { get; set; }
            IEnumerable<string> bcc { get; set; }
            IEnumerable<string> replyTo { get; set; }

            DateTimeOffset? sendEarliest { get; set; }
            DateTimeOffset? sendLatest { get; set; }
        }

        public MailJobStatus status { get; set; }

        /// <summary>
        /// body der Mail als txt / markdown
        /// </summary>
        public string body { get; set; }

        /// <summary>
        /// Each line of characters MUST be no more than 998 characters, and SHOULD be no more than 78 characters, excluding the CRLF.
        /// http://www.faqs.org/rfcs/rfc2822.html
        /// </summary>
        [MaxLength(78)]
        public string subject { get; set; }
        public MailPriority priority { get; set; }
        public MailJobAttachmentArray attachments { get; set; }

        public MailAddressArray to { get; set; }
        public MailAddressArray cc { get; set; }
        public MailAddressArray bcc { get; set; }
        public MailAddressArray replyTo { get; set; }

        public DateTimeOffset? sendEarliest { get; set; }
        public DateTimeOffset? sendLatest { get; set; }

        public DateTimeOffset? sent { get; set; }

        public DateTimeOffset? lastFail { get; set; }
        public DateTimeOffset? nextRun { get; set; }
        public int failCount { get; set; }

        public void SetNextRun(IApplicationUser user, DateTimeOffset nextRun)
        {
            if (this.status > MailJobStatus.Retry) throw new InvalidOperationException();
            if (this.sendEarliest.HasValue && nextRun < this.sendEarliest.Value) throw new InvalidOperationException();

            this.nextRun = nextRun;
            if (this.sendLatest.HasValue && nextRun > this.sendLatest)
            {
                this.status = MailJobStatus.Failed;
            }
        }

        public void MailSuccessfull(IApplicationUser user)
        {
            if (this.status > MailJobStatus.Retry) throw new InvalidOperationException();
            this.sent = DateTime.Now;
            this.nextRun = null;
            this.status = MailJobStatus.Sent;
        }

        public void MailFailed(IApplicationUser user)
        {
            if (this.status > MailJobStatus.Retry) throw new InvalidOperationException();
            this.failCount++;
            this.lastFail = DateTime.Now;
            if (this.failCount <= MAX_NUM_OF_RETRYS)
            {
                this.status = MailJobStatus.Retry;
                var waitBeforeRetryHours = 4 ^ (this.failCount - 1);
                this.SetNextRun(user, DateTime.Now.AddHours(waitBeforeRetryHours));
            }
            else
            {
                this.status = MailJobStatus.Failed;
                this.nextRun = null;
            }

        }

        public void PurgeMailJob(IApplicationUser user)
        {
            this.Delete(user);
        }
    }

    public enum MailJobStatus { Pending, Retry, Sent, Failed }

    [ComplexType]
    public class MailAddressArray : TJsonArray<Object>
    {
        //eigentlich string statt object

        public void Add(string item)
        {
            base.Add(item);
        }

        [NotMapped]
        public new string[] data
        {
            get
            {
                return base.data.Cast<string>().ToArray();
            }
            set
            {
                base.data = value;
            }
        }

        public bool hasAddress
        {
            get
            {
                return this.data.Length > 0;
            }
        }

        public string addressesCommaList
        {
            get
            {
                return this.data.Length > 0 ? string.Join(",", this.data) : "";
            }
        }
    }

    [ComplexType]
    public class MailJobAttachmentArray : TJsonArray<MailJobAttachment> { };

    public interface IMailJobAttachment
    {
        MailJobContentType contentType { get; set; }
        string filename { get; set; }
    }

    public class MailJobAttachment: IMailJobAttachment
    {
        public MailJobAttachment() { }
        public MailJobAttachment(IMailJobAttachment src) {
            this.filename = src.filename;
            this.contentType = src.contentType;
        }
        public MailJobAttachment(
            MailJobContentType contentType,
            string filename
            )
        {
            this.filename = filename;
            this.contentType = contentType;
        }

        //public byte[] content { get; set; }   //=> im Filesystem ablegen

        /// <summary>
        /// see System.Net.Mime.MediaTypeNames, e.g. see System.Net.Mime.MediaTypeNames.Pdf
        /// </summary>
        public MailJobContentType contentType { get; set; }

        /// <summary>
        /// System.Net.Mime.MediaTypeNames
        /// </summary>
        public string contentTypeAsString
        {
            get
            {
                switch (contentType)
                {
                    case MailJobContentType.None: return null;
                    case MailJobContentType.Plain: return "text/plain";
                    case MailJobContentType.Html: return "text/html";
                    case MailJobContentType.Xml: return "text/xml";
                    case MailJobContentType.RichText: return "text/richtext";
                    case MailJobContentType.Soap: return "application/soap+xml";
                    case MailJobContentType.Octet: return "application/octet-stream";
                    case MailJobContentType.Rtf: return "application/rtf";
                    case MailJobContentType.Pdf: return "application/pdf";
                    case MailJobContentType.Zip: return "application/zip";
                    case MailJobContentType.Gif: return "image/gif";
                    case MailJobContentType.Tiff: return "image/tiff";
                    case MailJobContentType.Jpeg: return "image/jpeg";
                    default: throw new NotImplementedException();
                }
            }
        }

        [MaxLength(100)]
        public string filename { get; set; }
    }



    public enum MailJobContentType
    {
        None = 0,
        Plain,
        Html,
        Xml,
        RichText,
        Soap,
        Octet,
        Rtf,
        Pdf,
        Zip,
        Gif,
        Tiff,
        Jpeg
    }
}
