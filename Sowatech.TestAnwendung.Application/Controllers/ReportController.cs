using Sowatech.TestAnwendung.Reporting;
using Sowatech.WebApi;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web.Http;

namespace Sowatech.TestAnwendung.Application.Controllers
{
    [Export(typeof(ReportController)), PartCreationPolicy(CreationPolicy.NonShared)]
    [UnhandledExceptionFilter]
    [Authorize(Roles = RoleNameAdministrator + "," + RoleNameSystemAdministrator + "," + RoleNameUser)]
    public class ReportController : ControllerBase
    {
        [HttpGet]
        public HttpResponseMessage getPdf()
        {
            var dataSource1 = new List<ViewModel1> { new ViewModel1("Holger", "Thiemann"), new ViewModel1("Peter", "Kaiser") };
            var report = Reporting.Report.Create("Report1").DataSource(dataSource1).RenderAsPdf();
            return ReturnFile(report, "Report1.pdf");
        }

        protected static HttpResponseMessage ReturnFile(PdfReport report, string fileName)
        {
            HttpResponseMessage result = new HttpResponseMessage(HttpStatusCode.OK);
            result.Content = new StreamContent(new MemoryStream(report.PdfData));
            result.Content.Headers.ContentType = new MediaTypeHeaderValue(report.MimeType);
            result.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment")
            {
                FileName = fileName
            };
            return result;
        }
    }
}