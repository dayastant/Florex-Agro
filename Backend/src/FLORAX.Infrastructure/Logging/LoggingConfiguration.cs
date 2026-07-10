using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace FLORAX.Infrastructure.Logging;

public static class LoggingConfiguration
{
    public static void ConfigureLogging(ILoggingBuilder loggingBuilder, IHostEnvironment environment)
    {
        loggingBuilder.ClearProviders();
        loggingBuilder.AddConsole();
        loggingBuilder.AddDebug();
        
        if (environment.IsDevelopment())
        {
            // Configure additional console/file logger endpoints for development
        }
    }
}
