using Sowatech.TestAnwendung.Dom;
using Sowatech.Dal.Repository;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;

namespace Sowatech.TestAnwendung.Dal
{
    public class ViewGetAllClientRepository<T> : ViewRepository<T>
        where T : ObjectWithIntId

    {
        public ViewGetAllClientRepository(SqlConnection connection) : base(connection)
        {
        }

        public IQueryable<T> Get(int client_Id)
        {
            return queryable.Where(obj => obj.client_id == client_Id);
        }
    }
}