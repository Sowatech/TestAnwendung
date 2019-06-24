using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;

namespace Sowatech.TestAnwendung.Reporting.Tests
{
    [TestClass]
    public class Report1Test
    {
        [TestMethod]
        public void Report1()
        {
            if (System.Web.HttpContext.Current == null)
            {
                System.Web.HttpContext.Current = new System.Web.HttpContext(
                    new System.Web.HttpRequest(System.IO.Path.GetRandomFileName(), "https://www.stackoverflow.com", string.Empty),
                    new System.Web.HttpResponse(System.IO.TextWriter.Null)
                    );
            }

            var dataSource1 = new List<ViewModel1> { new ViewModel1("Holger", "Thiemann"), new ViewModel1("Peter", "Kaiser") };
            var dataSource2 = new List<ViewModel2> { new ViewModel2("Müllenburg"), new ViewModel2("Im Teichert") };
            var report = Reporting.Report.Create("Report1").DataSource(dataSource1).DataSource(dataSource2).RenderAsPdf();
            var tmpFileName = Path.Combine(Path.GetTempPath(), GetType().FullName + ".pdf");
            File.WriteAllBytes(tmpFileName, report.PdfData);
            Process.Start(tmpFileName);
            Assert.IsFalse(report.Warnings.Any());
        }
    }
}