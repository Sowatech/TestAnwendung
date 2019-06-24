using System;

namespace Sowatech.TestAnwendung.Dal.Repositories
{
    public interface IFileRepository : IDisposable
    {
        void Init(string configuration);

        void Save(string fileName, byte[] data);

        byte[] Load(string fileName);

        void Delete(string fileName);

        string[] ListDirs(string path);

        string[] ListObjects(string path);

        string GetUrl(string fileName, string query = null);

        bool FileExists(string filePath);
    }
}