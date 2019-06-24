namespace Sowatech.TestAnwendung.Dom
{
    public interface ICounter
    {
        int NextValue(int liegenschaftsId, TCounterType counterType);
    }

    public enum TCounterType
    {
        WktrVertragsNummer = 1,
        LieferantenNummer = 2,
        LiegenschaftsObjekt = 3,
        JobNummer = 4
    };
}