using Sowatech.TestAnwendung.Dal.Migrations;
using System;
using System.Data.Entity;
using System.Linq;

namespace Sowatech.TestAnwendung.Dal
{
    public class MigrateDatabaseToLatestVersionInitializer : MigrateDatabaseToLatestVersion<EntityFrameworkContext, Configuration>
    {
    }
}