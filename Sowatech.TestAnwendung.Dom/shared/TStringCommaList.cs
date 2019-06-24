using System;
using System.Collections;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sowatech.TestAnwendung.Dom.shared
{

    [ComplexType]
    public class TStringCommaList
    {
        [MaxLength(250)]
        public virtual string csv { get; set; }
        public string[] data
        {
            get
            {
                if (_data == null)
                {
                    _data = TStringCommaList.GetItemsFromCsv(this.csv).ToArray();
                }

                return _data;
            }
            set
            {
                this._data = value;
                this.csv = string.Join(",", _data);
            }
        }

        [NotMapped]
        private string[] _data { get; set; }

        public void Clear()
        {
            this.data = new string[]{ };
        }

        public void AddItems(IEnumerable<string> items)
        {
            if (items == null || items.Count() == 0) return;
            var dataList = this.data.ToList();
            var missingItems = items.Where(item=>!this.data.Contains(item));
            if(missingItems.Count()>0) dataList.AddRange(missingItems);
            this.SetItems(dataList);
        }

        public void AddItem(string item)
        {
            if (item == null) return;
            this.AddItems(new string[] { item });
        }

        public void RemoveItems(IEnumerable<string> items)
        {
            if (items == null || items.Count()==0) return;
            this.data = this.data.Where(d => !items.Contains(d)).ToArray();
        }

        public void SetItems(IEnumerable<string> items)
        {
            if (items == null) items = new string[0];
            this.data = items.ToArray();
        }

        public bool hasEqualItems(TStringCommaList compareList)
        {
            return this.hasEqualItems(compareList.data);
        }

        public bool hasEqualItems(IEnumerable<string> compareItems)
        {
            return TStringCommaList.hasEqualItems(this.data,compareItems);
        }

        public bool hasDifferentItems(IEnumerable<string> compareItems)
        {
            return !hasEqualItems(this.data, compareItems);
        }

        public IEnumerable<string> getItemsMissingInCompare(TStringCommaList compareList)
        {
            return getItemsMissingInCompare(compareList.data);
        }

        public IEnumerable<string> getItemsMissingInCompare(IEnumerable<string> compareItems)
        {
            return TStringCommaList.getItemsMissingInCompare(this.data, compareItems);
        }

        public IEnumerable<string> getItemsSurplusInCompare(TStringCommaList compareList)
        {
            return getItemsSurplusInCompare(compareList.data);
        }

        public IEnumerable<string> getItemsSurplusInCompare(IEnumerable<string> compareItems)
        {
            return TStringCommaList.getItemsSurplusInCompare(this.data, compareItems);
        }

        public IEnumerable<string> getItemsIntersectingCompare(TStringCommaList compareList)
        {
            return getItemsIntersectingCompare(compareList.data);
        }

        public IEnumerable<string> getItemsIntersectingCompare(IEnumerable<string> compareItems)
        {
            return TStringCommaList.getItemsIntersectingCompare(this.data, compareItems);
        }

        #region static methods
        public static IEnumerable<string> GetItemsFromCsv(string csv)
        {
            return csv!=null ? csv.Split(','):new string[] { };
        }

        public static bool hasEqualItems(IEnumerable<string> items, IEnumerable<string> compareItems)
        {
            return items.All(item => compareItems.Contains(item)) && compareItems.Count() == items.Count();
        }

        public static IEnumerable<string> getItemsMissingInCompare(IEnumerable<string> items, IEnumerable<string> compareItems)
        {
            return items.Where(item => !compareItems.Contains(item));
        }

        public static IEnumerable<string> getItemsSurplusInCompare(IEnumerable<string> items, IEnumerable<string> compareItems)
        {
            return compareItems.Where(item => !items.Contains(item));
        }

        public static IEnumerable<string> getItemsIntersectingCompare(IEnumerable<string> items, IEnumerable<string> compareItems)
        {
            return compareItems.Where(item => items.Contains(item));
        }

        #endregion
    }
}
