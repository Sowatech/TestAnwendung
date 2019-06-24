using Sowatech.TestAnwendung.Dom;
using Sowatech.Dal.Repository;
using Sowatech.UnitOfWork;
using System;
using System.Data.SqlClient;
using System.Linq;

namespace Sowatech.TestAnwendung.Dal
{
    public class ViewGetByIntIdRepository<T> : ViewRepository<T>, IGetByIdRepository<T, int>
        where T : ObjectWithIntId
    {
        public ViewGetByIntIdRepository(SqlConnection connection) : base(connection)
        {
        }

        public T Get(int id)
        {
            return queryable.FirstOrDefault(obj => obj.id == id);
        }
    }
}