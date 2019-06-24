using System;
using System.Data.Entity.Migrations;
using System.Linq;

namespace Sowatech.TestAnwendung.Dal.Migrations
{
    public class Configuration : DbMigrationsConfiguration<Sowatech.TestAnwendung.Dal.EntityFrameworkContext>
    {
        public Configuration()
        {
            AutomaticMigrationsEnabled = Settings.Default.Automigration;
            AutomaticMigrationDataLossAllowed = Settings.Default.Automigration;
        }
    }
}