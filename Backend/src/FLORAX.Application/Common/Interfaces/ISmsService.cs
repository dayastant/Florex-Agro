using System.Threading;
using System.Threading.Tasks;

namespace FLORAX.Application.Common.Interfaces;

public interface ISmsService
{
    Task SendSmsAsync(string phoneNumber, string message, CancellationToken cancellationToken = default);
}
