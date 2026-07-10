using System.Diagnostics;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.Extensions.Logging;

namespace FLORAX.Application.Common.Behaviors;

public class LoggingBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly ILogger<LoggingBehavior<TRequest, TResponse>> _logger;

    public LoggingBehavior(ILogger<LoggingBehavior<TRequest, TResponse>> logger)
    {
        _logger = logger;
    }

    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        var requestName = typeof(TRequest).Name;

        _logger.LogInformation("FLORAX Request: Starting execution of {Name}", requestName);

        var stopwatch = Stopwatch.StartNew();
        
        var response = await next();

        stopwatch.Stop();

        _logger.LogInformation("FLORAX Request: Finished execution of {Name} in {ElapsedMilliseconds}ms", requestName, stopwatch.ElapsedMilliseconds);

        return response;
    }
}
