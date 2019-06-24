using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Reflection;
using System.Web;

/// <summary>
/// Hilfsklassen für dynamische serverseitige Filterung einer ds-datsource (Typescript Component)
/// </summary>
namespace Sowatech.TestAnwendung.Application.Models.QueryDtos
{

    public class SortItem
    {
        public string fieldname;
        public bool reverse;
    }

    public class FilterItem
    {
        public string[] fieldnames;
        public string fieldnamesCommaString
        {
            get
            {
                return string.Join(",", this.fieldnames);
            }
        }
        public string[] fieldvalues;
        public string fieldvaluesCommaString
        {
            get
            {
                return string.Join(",", this.fieldvalues);
            }
        }
        public FilterOperator filterOperator;

        public bool hasFieldValue
        {
            get
            {
                var s = this.fieldvaluesCommaString;
                return s != null && s != "";
            }
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="comparer">(filtervalue: string) => boolean</param>
        /// <returns></returns>
        public bool valueMatchesFilter(Func<string, bool> comparer)
        {
            var result = false;
            if (!result)
            {
                foreach (var fieldvalue in this.fieldvalues)
                {
                    result = comparer(fieldvalue);
                    if (result) break;
                }
            }
            return result;
        }
    }

    public enum FilterOperator { StartsWith, IsEqual, Contains, IsGreaterOrEqual, IsLessOrEqual };

    public class PaginationInfo
    {
        public int currentPageIndex;
        public int currentPageNumOfItems;
        public int maxPageIndex;
        public int totalNumOfItems;
        public int pageSize;
    }

    public class RefreshParams
    {
        public PaginationInfo paginationInfo;
        public SortItem[] sortItems;
        public FilterItem[] filterItems;
    }

    public class RefreshResult<T>
    {
        public RefreshResult(RefreshParams refreshParams, IEnumerable<T> data)
        {
            this.refreshParams = refreshParams;
            this.data = data;
        }
        public RefreshParams refreshParams;
        public IEnumerable<T> data;
    }

    public class SortComparer<T> : IComparer<T>
    {
        public SortComparer(SortItem sortItem)
        {
            this.sortItem = sortItem;
            propInfo = typeof(T).GetProperty(this.sortItem.fieldname);
        }

        SortItem sortItem;
        PropertyInfo propInfo;
        public int Compare(T a, T b)
        {
            IComparable valueA = propInfo.GetValue(a) as IComparable;
            IComparable valueB = propInfo.GetValue(b) as IComparable;
            if (valueA == null && valueA == null) return 0;

            int result = 0;
            if (valueA != null)
            {
                result = valueA.CompareTo(valueB);
            }
            else
            {
                result = valueB.CompareTo(valueA);
            }
            if (sortItem.reverse) result *= -1;

            return result;
        }
    }

    public class FilterComparer<T>
    {
        public FilterComparer(IEnumerable<FilterItem> filterItems)
        {
            this.filterItems = filterItems;

            foreach (var filterItem in filterItems)
            {
                foreach (var fieldname in filterItem.fieldnames)
                {
                    propInfos[fieldname] = typeof(T).GetProperty(fieldname);
                }
            }
        }

        #region helper fuer filterung im RAM
        IEnumerable<FilterItem> filterItems;
        Dictionary<string, PropertyInfo> propInfos = new Dictionary<string, PropertyInfo>();
        public bool dtoIsInFilter(T dto)
        {
            var result = filterItems.Count() > 0 ? false : true;//ohne filteritems => immer "im Filter"
            foreach (var filterItem in filterItems)
            {
                foreach (var fieldname in filterItem.fieldnames)
                {
                    foreach (var fieldvalue in filterItem.fieldvalues)
                    {
                        result = matchesFilterOperator(dto, filterItem.filterOperator, fieldname, fieldvalue);
                        if (result) break;//erster Erfolg reicht (OR der FieldValues)
                    }
                    if (result) break;//erster Erfolg reicht (OR der FieldNames)
                }
                if (!result) break;//erster Mißerfolg reicht zum Abbruch (AND der FilterItems)
            }
            return result;
        }

        private enum FieldMatchingType { stringBased, numericBased }

        bool matchesFilterOperator(T dto, FilterOperator filterOperator, string fieldname, string fieldvalue)
        {
            var result = false;
            var dtoValue = propInfos[fieldname].GetValue(dto);
            if (dtoValue != null)
            {
                if (dtoValue is string || dtoValue is bool)
                {
                    return matchesFilterOperatorStringBased(dtoValue, filterOperator, fieldname, fieldvalue);
                }
                if (dtoValue is DateTimeOffset || dtoValue is DateTime)
                {
                    return matchesFilterOperatorDateBased(dtoValue, filterOperator, fieldname, fieldvalue);
                }
                return matchesFilterOperatorNumericBased(dtoValue, filterOperator, fieldname, fieldvalue);

            }
            else
            {
                result = (string.IsNullOrEmpty(fieldvalue));
            }
            return result;
        }

        bool matchesFilterOperatorStringBased(object dtoValue, FilterOperator filterOperator, string fieldname, string fieldvalue)
        {
            bool result = false;
            var dtoValueAsString = dtoValue.ToString().ToLowerInvariant().Trim();
            var fieldValueLower = fieldvalue.ToLowerInvariant().Trim();
            switch (filterOperator)
            {
                case FilterOperator.Contains:
                    result = dtoValueAsString.Contains(fieldValueLower);
                    break;
                case FilterOperator.StartsWith:
                    result = dtoValueAsString.StartsWith(fieldValueLower);
                    break;
                case FilterOperator.IsEqual:
                    result = dtoValueAsString.Equals(fieldValueLower);
                    break;
                case FilterOperator.IsGreaterOrEqual:
                    result = fieldValueLower.CompareTo(dtoValue) >= 0;
                    break;
                case FilterOperator.IsLessOrEqual:
                    result = fieldValueLower.CompareTo(dtoValue) <= 0;
                    break;
                default:
                    throw new NotImplementedException();
            }
            return result;
        }

        bool matchesFilterOperatorNumericBased(object dtoValue, FilterOperator filterOperator, string fieldname, string fieldvalue)
        {
            bool result = false;
            decimal dtoValueAsDecimal = Convert.ToDecimal(dtoValue);
            decimal fieldValueAsDecimal;
            if (Decimal.TryParse(fieldvalue, NumberStyles.Any, CultureInfo.InvariantCulture, out fieldValueAsDecimal))
            {
                switch (filterOperator)
                {
                    case FilterOperator.Contains:
                    case FilterOperator.StartsWith:
                        throw new InvalidOperationException("Cannot use filteroperation contains or startwith on numeric values");
                    case FilterOperator.IsEqual:
                        result = dtoValueAsDecimal == fieldValueAsDecimal;
                        break;
                    case FilterOperator.IsGreaterOrEqual:
                        result = Convert.ToDecimal(dtoValue) >= fieldValueAsDecimal;
                        break;
                    case FilterOperator.IsLessOrEqual:
                        result = Convert.ToDecimal(dtoValue) <= fieldValueAsDecimal;
                        break;
                    default:
                        throw new NotImplementedException();
                }
            }
            else
            {
                result = false;
            }
            return result;
        }

        bool matchesFilterOperatorDateBased(object dtoValue, FilterOperator filterOperator, string fieldname, string fieldvalue)
        {
            bool result = false;
            var fieldValueAsStringLower = fieldvalue.ToLowerInvariant().Trim();
            DateTime fieldValueAsDate;
            DateTime.TryParse(fieldvalue, out fieldValueAsDate);
            DateTime? dtoValueAsDate = null;
            string dtoValueAsString = string.Empty;
            if (dtoValue is DateTimeOffset)
            {
                dtoValueAsDate = ((DateTimeOffset)dtoValue).DateTime;
                dtoValueAsString = ((DateTimeOffset)dtoValue).ToString("yyyy-MM-dd");
            }
            else if (dtoValue is DateTime)
            {
                dtoValueAsDate = (DateTime)dtoValue;
                dtoValueAsString = ((DateTime)dtoValue).ToString("yyyy-MM-dd");
            }
            switch (filterOperator)
            {
                case FilterOperator.Contains:
                    result = dtoValueAsString.Contains(fieldValueAsStringLower);
                    break;
                case FilterOperator.StartsWith:
                    result = dtoValueAsString.StartsWith(fieldValueAsStringLower);
                    break;
                case FilterOperator.IsEqual:
                    result = dtoValueAsString.Equals(fieldValueAsStringLower);
                    break;
                case FilterOperator.IsGreaterOrEqual:
                    result = dtoValueAsDate >= fieldValueAsDate;
                    break;
                case FilterOperator.IsLessOrEqual:
                    result = dtoValueAsDate <= fieldValueAsDate;
                    break;
                default:
                    throw new NotImplementedException();
            }
            return result;
        }
        #endregion
    }
}