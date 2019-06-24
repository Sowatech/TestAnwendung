using Sowatech.TestAnwendung.Dal.ApplicationServices.MailQueue;
using Sowatech.TestAnwendung.Dom;
using Sowatech.ServiceLocation;
using Sowatech.Threading;
using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Net.Mime;
using System.Threading;
using System.Threading.Tasks;

namespace Sowatech.TestAnwendung.Application
{
    [Export(typeof(MailQueue)), PartCreationPolicy(CreationPolicy.NonShared)]
    public class MailQueue : Service
    {
        [ImportingConstructor]
        public MailQueue(IServiceLocator serviceLocator)
        {
            this.serviceLocator = serviceLocator;
            this.ApplicationUser = DummyUserFactory.CreateDummyUser("MailQueue");
        }

        private IServiceLocator serviceLocator;
        private IApplicationUser ApplicationUser { get; set; }

        protected override void ThreadStarted()
        {
            base.ThreadStarted();
            WaitSeconds(Properties.Settings.Default.MailQueueInitialDelayInSeconds);
        }

        protected override void ServiceLoop()
        {
            Logger.Info("{0}.ServiceLoop started", GetType().FullName);
            using (var uow = serviceLocator.GetAllInstances<UnitOfWork>().Single().Value)
            {
                var clientSettings = uow.ClientSettingsDom.Get();
                foreach (var clientSetting in clientSettings)
                {
                    Logger.Info("{0}.ServiceLoop started for client.id={1}", GetType().FullName, clientSetting.client_id);
                    SetSmtpProperties(clientSetting);
                    var outgoingMailJobs = uow.MailJobsDom.GetMailsForSending(clientSetting.id);
                    foreach (var mailJob in outgoingMailJobs)
                    {
                        Attachment[] attachments = CreateAttachments(mailJob);
                        MailMessage mailMessage = CreateMailMessage(mailJob, attachments);
                        SendMail(
                            mailMessage,
                            mailJob.id,
                            id =>
                            {
                                var successfullMailJob = outgoingMailJobs.Single(mj => mj.id == id);
                                successfullMailJob.MailSuccessfull(ApplicationUser);
                            },
                            (id, ex) =>
                            {
                                var failedMailJob = outgoingMailJobs.Single(mj => mj.id == id);
                                failedMailJob.MailFailed(ApplicationUser);
                                Logger.Error(ex, "{0}.ServiceLoop client.id={1}", GetType().FullName, clientSetting.client_id);
                            }
                        );
                    }
                    Logger.Info("{0}.ServiceLoop WaitForAllMailsSent client.id={1}", GetType().FullName, clientSetting.client_id);
                    WaitForAllMailsSent();
                    uow.SaveChanges();
                    Logger.Info("{0}.ServiceLoop saved client.id={1}", GetType().FullName, clientSetting.client_id);
                }
            }
        }

        private int mailsInQueue = 0;
        private Semaphore maxSendThreads = new Semaphore(10, 10);
        private object mutex = new object();
        private ManualResetEvent allMailsSent = new ManualResetEvent(false);

        private void SetSmtpProperties(Dom.ClientSettings clientSetting)
        {
            this.credentials = new System.Net.NetworkCredential(clientSetting.SmtpAccount.username, clientSetting.SmtpAccount.password);
            this.enableSsl = clientSetting.SmtpAccount.sslEnabled;
            this.serverUrl = clientSetting.SmtpAccount.serverUrl;
            this.fromEmail = clientSetting.SmtpAccount.email;
        }
        private ICredentialsByHost credentials;
        private bool enableSsl;
        private string serverUrl;
        private string fromEmail;

        private MailMessage CreateMailMessage(MailJob mailJob, Attachment[] attachments)
        {
            var mailMessage = new MailMessage();
            mailMessage.Subject = mailJob.subject;
            mailMessage.Body = mailJob.body;
            mailMessage.IsBodyHtml = false;
            mailMessage.Priority = mailJob.priority;
            mailMessage.To.Add(mailJob.to.addressesCommaList);
            if (mailJob.cc.hasAddress) mailMessage.CC.Add(mailJob.cc.addressesCommaList);
            if (mailJob.bcc.hasAddress) mailMessage.Bcc.Add(mailJob.bcc.addressesCommaList);
            if (mailJob.replyTo.hasAddress) mailMessage.ReplyToList.Add(mailJob.replyTo.addressesCommaList);
            mailMessage.From = new MailAddress(fromEmail);

            foreach (var attachment in attachments) mailMessage.Attachments.Add(attachment);
            return mailMessage;
        }

        [Obsolete("TODO:CreateAttachments=>FileRepository")]
        private static Attachment[] CreateAttachments(MailJob mailJob)
        {
            Attachment[] attachments = new List<Attachment>().ToArray();
            foreach (var maiJobAttachment in mailJob.attachments.data)
            {
                if (maiJobAttachment.contentType != MailJobContentType.None)
                {
                    byte[] fileData = { };//todo:=>filerepository
                    attachments = new Attachment[] { new Attachment(new MemoryStream(fileData), new ContentType(maiJobAttachment.contentTypeAsString) { Name = maiJobAttachment.filename }) };
                }
            }
            return attachments;
        }

        private void SendMail<IDTYPE>(
            MailMessage mail,
            IDTYPE id,
            Action<IDTYPE> successCallback = null,
            Action<IDTYPE, Exception> errorCallback = null)
        {
            Logger.Info("{0}.SendMail id={1} subject={2}", typeof(MailQueue).FullName, id, mail.Subject);
            lock (mutex)
            {
                mailsInQueue++;
                allMailsSent.Reset();
                Logger.Info("{0}.SendMail {1} mails in queue", typeof(MailQueue).FullName, mailsInQueue);
            }
            maxSendThreads.WaitOne();
            Logger.Info("{0}.SendMail Start Task id={1} subject={2}", typeof(MailQueue).FullName, id, mail.Subject);
            Task.Run(() =>
            {
                Logger.Info("{0}.SendMail Task Started id={1} subject={2}", typeof(MailQueue).FullName, id, mail.Subject);
                try
                {
                    try
                    {
                        using (var smtpClient = new SmtpClient(this.serverUrl))
                        {
                            smtpClient.Credentials = this.credentials;
                            smtpClient.EnableSsl = this.enableSsl;
                            using (mail)
                            {
                                Logger.Info("{0}.SendMail Sending id={1} subject={2}", typeof(MailQueue).FullName, id, mail.Subject);
                                smtpClient.Send(mail);
                                Logger.Info("{0}.SendMail Sent id={1} subject={2}", typeof(MailQueue).FullName, id, mail.Subject);
                            }
                        }
                        lock (mutex)
                        {
                            Logger.Info("{0}.SendMail Success Callback id={1} subject={2}", typeof(MailQueue).FullName, id, mail.Subject);
                            if (successCallback != null) successCallback(id);
                        }
                    }
                    finally
                    {
                        maxSendThreads.Release();
                        lock (mutex)
                        {
                            mailsInQueue--;
                            Logger.Info("{0}.SendMail {1} mails in queue", typeof(MailQueue).FullName, mailsInQueue);
                            if (mailsInQueue == 0)
                            {
                                Logger.Info("{0}.SendMail All Mails Sent", typeof(MailQueue).FullName);
                                allMailsSent.Set();
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    Logger.Error(ex, "{0}.SendMail id={1} subject={2}", typeof(MailQueue).FullName, id, mail.Subject);
                    lock (mutex)
                    {
                        Logger.Info("{0}.SendMail Error Callback id={1} subject={2}", typeof(MailQueue).FullName, id, mail.Subject);
                        if (errorCallback != null) errorCallback(id, ex);
                    }
                }
            });
        }

        public void WaitForAllMailsSent()
        {
            allMailsSent.WaitOne();
        }

        protected override int PauseTimeImMs
        {
            get
            {
                return Properties.Settings.Default.MailQueuePauseTimeImMs;
            }
        }

        protected override int ErrorPauseTimeInSeconds
        {
            get
            {
                return Properties.Settings.Default.MailQueueErrorPauseTimeInSeconds;
            }
        }
    }
}