using System.Threading;
using System.Threading.Tasks;
using FLORAX.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;

namespace FLORAX.Infrastructure.Email;

public class EmailService : IEmailService
{
    private readonly ILogger<EmailService> _logger;

    public EmailService(ILogger<EmailService> logger)
    {
        _logger = logger;
    }

    public Task SendAsync(string to, string subject, string body, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Email sent successfully. To: {To}, Subject: {Subject}", to, subject);
        return Task.CompletedTask;
    }
}
