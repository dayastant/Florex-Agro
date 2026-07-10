using System.IO;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace FLORAX.Infrastructure.Cloud;

public class CloudStorageService
{
    private readonly ILogger<CloudStorageService> _logger;

    public CloudStorageService(ILogger<CloudStorageService> logger)
    {
        _logger = logger;
    }

    public Task UploadBackupAsync(string fileName, Stream content)
    {
        _logger.LogInformation("Uploading database backup file {FileName} to cloud storage...", fileName);
        return Task.CompletedTask;
    }
}
