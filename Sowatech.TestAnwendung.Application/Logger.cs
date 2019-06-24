using Sowatech.Logging;
using System;
using System.ComponentModel.Composition;
using System.Linq;

namespace Sowatech.TestAnwendung.Application
{
    [Export(typeof(ILogger)), PartCreationPolicy(CreationPolicy.Shared)]
    public class Logger : WebApplicationLogger, ILogger
    {
    }
}