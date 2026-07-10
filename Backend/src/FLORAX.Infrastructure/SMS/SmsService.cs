using System.Threading;
using System.Threading.Tasks;
using FLORAX.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;

namespace FLORAX.Infrastructure.SMS;

public class SmsService : ISmsService
{
    private readonly ILogger<SmsService> _logger;

    public SmsService(ILogger<SmsService> logger)
    {
        _logger = logger;
    }

    public Task SendSmsAsync(string phoneNumber, string message, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("SMS sent successfully. To: {PhoneNumber}, Message: {Message}", phoneNumber, message);
        return Task.CompletedTask;
    }
}
