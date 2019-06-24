using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sowatech.TestAnwendung.Dom
{
    #region interfaces
    public interface ISelectItem
    {
        string value { get; set; }
        string text { get; set; }
    }

    public interface ISubSelectItem : ISelectItem
    {
        string parentvalue { get; set; }
    }

    public interface ICheckedItem : ISelectItem
    {
        bool isChecked { get; set; }
    }
    #endregion

    public class SelectItem:ISelectItem
    {
        public SelectItem() { }
        public SelectItem(ISelectItem src=null)
        {
            if (src != null)
            {
                this.value = src.value;
                this.text = src.text;
            }
        }

        public SelectItem(string value,string text){
            this.value = value;
            this.text = text;
        }

        public string value { get; set; }
        public string text { get; set; }
    }

    public class SubSelectItem:SelectItem, ISubSelectItem
    {
        public SubSelectItem(ISubSelectItem src = null):base(src)
        {
            if (src != null)
            {
                this.parentvalue = src.parentvalue;
            }
        }
        public string parentvalue { get; set; }
    }
    
    public class CheckedItem:SelectItem,ICheckedItem
    {
        public CheckedItem(ICheckedItem src = null):base(src)
        {
            if (src != null)
            {
                this.isChecked = src.isChecked;
            }
        }

        public bool isChecked { get; set; }
    }
}
