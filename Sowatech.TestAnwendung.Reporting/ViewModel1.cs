namespace Sowatech.TestAnwendung.Reporting
{
    public class ViewModel1
    {
        public ViewModel1(string Vorname, string Nachname)
        {
            this.Vorname = Vorname;
            this.Nachname = Nachname;
        }

        public string Vorname { get; }
        public string Nachname { get; }
    }
}