using Microsoft.Reporting.WebForms;
using System.Collections;
using System.Collections.Generic;
using System.Linq;

namespace Sowatech.TestAnwendung.Reporting
{
    public class Report
    {
        private Report(string reportName)
        {
            this.reportName = reportName;
        }

        private string reportName;

        public static Report Create(string reportName)
        {
            return new Report(reportName);
        }

        public Report DataSource(string name, object dataSource)
        {
            dataSources.Add(name, dataSource);
            return this;
        }

        public Report DataSource(object dataSource)
        {
            string name;
            if (dataSource is IEnumerable)
            {
                name = dataSource.GetType().GetGenericArguments()[0].Name;
            }
            else
            {
                name = dataSource.GetType().Name;
            }
            return DataSource(name, dataSource);
        }

        private Dictionary<string, object> dataSources = new Dictionary<string, object>();

        public Report Dpi(int dpiX, int dpiY)
        {
            this.dpiX = dpiX;
            this.dpiY = dpiY;
            return this;
        }

        private int dpiX;
        private int dpiY;

        public PdfReport RenderAsPdf()
        {
            var reportResults = Render("PDF", "HumanReadablePDF=\"true\"");
            return new PdfReport(reportResults.RenderedData, reportResults.MimeType, reportResults.ReportWarnings);
        }

        private ReportResults Render(string format, string additionalParams)
        {
            using (ReportViewer reportViewer = new ReportViewer())
            {
                reportViewer.LocalReport.ReportEmbeddedResource = string.Format("{0}.{1}.rdlc", GetType().Namespace, reportName);

                SetDataSources(reportViewer.LocalReport.DataSources);
                reportViewer.LocalReport.SubreportProcessing += (s, e) =>
                {
                    SetDataSources(e.DataSources);
                };

                Microsoft.Reporting.WebForms.Warning[] warnings;
                string[] streamIds;
                string mimeType = string.Empty;
                string encoding = string.Empty;
                string extension = string.Empty;

                reportViewer.PageCountMode = PageCountMode.Actual;
                reportViewer.LocalReport.Refresh();

                byte[] renderedData = reportViewer.LocalReport.Render(format, string.Format("<DeviceInfo DpiX=\"{0}\" DpiY=\"{1}\" {2} />", dpiX, dpiY, additionalParams), out mimeType, out encoding, out extension, out streamIds, out warnings);

                Warning[] reportWarnings = ConvertWarnings(warnings);
                return new ReportResults(renderedData, mimeType, encoding, extension, reportWarnings, streamIds);
            }
        }

        private class ReportResults
        {
            public ReportResults(byte[] renderedData, string mimeType, string encoding, string extension, Warning[] reportWarnings, string[] streamIds)
            {
                this.RenderedData = renderedData;
                this.MimeType = mimeType;
                this.Encoding = encoding;
                this.Extension = extension;
                this.ReportWarnings = reportWarnings;
                this.StreamIds = streamIds;
            }

            public byte[] RenderedData { get; }
            public string MimeType { get; }
            public string Encoding { get; }
            public string Extension { get; }
            public Warning[] ReportWarnings { get; }
            public string[] StreamIds { get; }
        }

        private static Warning[] ConvertWarnings(Microsoft.Reporting.WebForms.Warning[] warnings)
        {
            Warning[] reportWarnings;
            if (warnings != null && warnings.Length > 0)
            {
                reportWarnings = warnings.Select(w => new Warning(w.Code, w.Message, w.ObjectName, w.ObjectType, (Severity)(int)w.Severity)).ToArray();
            }
            else
            {
                reportWarnings = new Warning[] { };
            }

            return reportWarnings;
        }

        private void SetDataSources(ReportDataSourceCollection reportDataSources)
        {
            reportDataSources.Clear();
            foreach (var dataSource in dataSources)
            {
                if (dataSource.Value is IEnumerable)
                {
                    reportDataSources.Add(new ReportDataSource(dataSource.Key, (IEnumerable)dataSource.Value));
                }
                else
                {
                    reportDataSources.Add(new ReportDataSource(dataSource.Key, dataSource.Value));
                }
            }
        }
    }

    public abstract class RenderedReport
    {
        public RenderedReport(string MimeType, Warning[] Warnings)
        {
            this.MimeType = MimeType;
            this.Warnings = Warnings;
        }

        public string MimeType { get; private set; }

        public Warning[] Warnings { get; }
    }

    public class PdfReport : RenderedReport
    {
        public PdfReport(byte[] PdfData, string MimeType, Warning[] Warnings) : base(MimeType, Warnings)
        {
            this.PdfData = PdfData;
        }

        public byte[] PdfData { get; }
    }

    public class Warning
    {
        public Warning(string Code, string Message, string ObjectName, string ObjectType, Severity Severity)
        {
            this.Code = Code;
            this.Message = Message;
            this.ObjectName = ObjectName;
            this.ObjectType = ObjectType;
            this.Severity = Severity;
        }

        public string Code { get; }
        public string Message { get; }
        public string ObjectName { get; }
        public string ObjectType { get; }
        public Severity Severity { get; }
    }

    public enum Severity
    {
        Warning = 0,
        Error = 1
    }
}