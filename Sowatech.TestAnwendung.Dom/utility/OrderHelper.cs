using System.Collections.Generic;
using System.Linq;

namespace Sowatech.eExam.Dom.Examen
{
    public static class OrderHelper
    {
        private enum DropDirection { upwards, downwards, atpos }
        public static void MoveToOrderValue(IEnumerable<IObjectWithOrderValue> list, IObjectWithOrderValue obj, int newOrderValue)
        {
            if (newOrderValue <= 0) newOrderValue = 1;
            DropDirection dropDirection = obj.order > newOrderValue ? DropDirection.upwards : (obj.order < newOrderValue ? DropDirection.downwards : DropDirection.atpos);
            switch (dropDirection)
            {
                case DropDirection.downwards:
                    foreach (var a in list.Where(a => a.order > obj.order && a.order <= newOrderValue).ToList())
                    {
                        a.order = a.order - 1;
                    }
                    break;
                case DropDirection.atpos:
                case DropDirection.upwards:
                    foreach (var a in list.Where(a => a.order >= newOrderValue && a.order < obj.order).ToList())
                    {
                        a.order = a.order + 1;
                    }
                    break;
            }
            obj.order = newOrderValue;
        }

        public static void RenewAllOrderValues(IEnumerable<IObjectWithOrderValue> list)
        {
            var r = 1;
            foreach (var a in list.OrderBy(an => an.order).ToList())
            {
                a.order = r;
                r++;
            }
        }

        public static int GetMaxOrderValue(IEnumerable<IObjectWithOrderValue> list)
        {
            return list.Count() > 0 ? list.Max(a => a.order) : 0;
        }
    }

    public interface IObjectWithOrderValue
    {
        int order { get; set; }
    }
}
