using System;

namespace Sowatech.TestAnwendung.Dom
{
    public static class DateTimeOffsetDom
    {
        public static Func<DateTimeOffset> now = () => DateTimeOffset.Now;

        public static DateTimeOffset Now
        {
            get
            {
                return now();
            }
        }

        public static Func<DateTimeOffset> utcNow = () => DateTimeOffset.UtcNow;

        public static DateTimeOffset UtcNow
        {
            get
            {
                return utcNow();
            }
        }
    }
}