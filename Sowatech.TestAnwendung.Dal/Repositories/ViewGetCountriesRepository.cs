using Sowatech.TestAnwendung.Dom;
using Sowatech.Dal.Repository;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Data.SqlClient;
using System.Linq;

namespace Sowatech.TestAnwendung.Dal
{
    public class ViewGetCountriesRepository : ViewRepository<ViewGetCountriesRepository.CountryDto>
    {
        public ViewGetCountriesRepository(SqlConnection connection) : base(connection)
        {
        }
        
        public IEnumerable<SelectItem> Get()
        {
            return queryable.OrderBy(data=>data.name).ToList().Select(dto=>new SelectItem(dto.iso2,dto.name));
        }

        public class CountryDto
        {
            [Key]
            public System.String iso2 { get; set; }
            public System.String name { get; set; }
            private static string ViewSql
            {
                get
                {
                    return string.Format(@"
                    SELECT iso2, 
                    name
                    FROM country
                ");
                }
            }
        }
    }

    
}