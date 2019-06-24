using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Sowatech.TestAnwendung.Application.Models.QueryDtos
{
    public class QueryHelper<T>
    {
        public RefreshResult<T> Execute(RefreshParams refreshParams, List<T> dtos)
        {
            if (dtos!=null && dtos.Count>0 && refreshParams.paginationInfo.pageSize > 0)
            {
                //todo filter
                if (refreshParams.filterItems.Length > 0)
                {
                    var filterComparer = new FilterComparer<T>(refreshParams.filterItems);
                    dtos = dtos.Where(dto => filterComparer.dtoIsInFilter(dto)).ToList();
                }
                refreshParams.paginationInfo.totalNumOfItems = dtos.Count();

                //sort
                if (refreshParams.sortItems.Length > 0)
                {
                    var sortItem = refreshParams.sortItems[0];
                    dtos.Sort(new SortComparer<T>(sortItem));
                }

                //paging
                refreshParams.paginationInfo.maxPageIndex = Convert.ToInt32(Math.Ceiling((decimal)refreshParams.paginationInfo.totalNumOfItems / (decimal)refreshParams.paginationInfo.pageSize)) - 1;
                if (refreshParams.paginationInfo.maxPageIndex < 0) refreshParams.paginationInfo.maxPageIndex = 0;
                if (refreshParams.paginationInfo.currentPageIndex > refreshParams.paginationInfo.maxPageIndex)
                {
                    refreshParams.paginationInfo.currentPageIndex = refreshParams.paginationInfo.maxPageIndex;
                }

                dtos = dtos
                    .Skip(refreshParams.paginationInfo.currentPageIndex * refreshParams.paginationInfo.pageSize)
                    .Take(refreshParams.paginationInfo.pageSize)
                    .ToList();
                refreshParams.paginationInfo.currentPageNumOfItems = dtos.Count();

            }
            else
            {
                dtos = new List<T>();
                refreshParams.paginationInfo.currentPageNumOfItems = dtos.Count();
                refreshParams.paginationInfo.currentPageIndex = 0;
                refreshParams.paginationInfo.maxPageIndex = 0;
                refreshParams.paginationInfo.totalNumOfItems = 0;
            }

            var result = new RefreshResult<T>(refreshParams, dtos);
            return result;
        }
    }
}