using System;

namespace Sowatech.TestAnwendung.Dom
{
    public static class DateTimeDom
    {
        public static Func<DateTime> now = () => DateTime.Now;

        public static DateTime Now
        {
            get
            {
                return now();
            }
        }

        public static Func<DateTime> utcNow = () => DateTime.UtcNow;

        public static DateTime UtcNow
        {
            get
            {
                return utcNow();
            }
        }

        public static Func<DateTime> today = () => DateTime.Today;

        public static DateTime Today
        {
            get
            {
                return today();
            }
        }
    }
}