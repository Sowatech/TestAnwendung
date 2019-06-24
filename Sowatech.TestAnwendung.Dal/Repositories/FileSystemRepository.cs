using System;
using System.ComponentModel.Composition;
using System.IO;
using System.Web.Hosting;

namespace Sowatech.TestAnwendung.Dal.Repositories
{
    [Export("FileSystem", typeof(Sowatech.TestAnwendung.Dal.Repositories.IFileRepository)), PartCreationPolicy(CreationPolicy.NonShared)]
    public class FileSystemRepository : IFileRepository
    {
        public void Init(string configuration)
        {
            basePath = HostingEnvironment.MapPath(configuration);
        }

        private string basePath;

        public void Save(string fileName, byte[] data)
        {
            string absolutePath = GetAbsolutePath(fileName);
            string directory = Path.GetDirectoryName(absolutePath);
            if (!Directory.Exists(directory))
            {
                Directory.CreateDirectory(directory);
            }
            File.WriteAllBytes(absolutePath, data);
        }

        private string GetAbsolutePath(string fileName)
        {
            return Path.Combine(basePath, fileName);
        }

        public byte[] Load(string fileName)
        {
            return File.ReadAllBytes(GetAbsolutePath(fileName));
        }

        public void Delete(string fileName)
        {
            File.Delete(GetAbsolutePath(fileName));
        }

        public string[] ListDirs(string path)
        {
            return Directory.GetDirectories(GetAbsolutePath(path));
        }

        public string[] ListObjects(string path)
        {
            return Directory.GetFiles(GetAbsolutePath(path));
        }

        public string GetUrl(string fileName, string query = null)
        {
            if (!string.IsNullOrEmpty(query))
            {
                query = "?" + query;
            }
            else
            {
                query = string.Empty;
            }
            return string.Format("file://{0}{1}", GetAbsolutePath(fileName), query);
        }

        public bool FileExists(string filePath)
        {
            string absolutePath = GetAbsolutePath(filePath);
            return File.Exists(absolutePath);
        }

        public void Dispose()
        {
        }
    }
}
