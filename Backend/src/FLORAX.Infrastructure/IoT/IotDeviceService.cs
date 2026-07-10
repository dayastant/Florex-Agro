using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace FLORAX.Infrastructure.IoT;

public class IotDeviceService
{
    private readonly ILogger<IotDeviceService> _logger;

    public IotDeviceService(ILogger<IotDeviceService> logger)
    {
        _logger = logger;
    }

    public Task ProcessTelemetryAsync(string deviceSerial, decimal moisturePercentage)
    {
        _logger.LogInformation("Processing telemetry from device {Serial}: Moisture {Moisture}%", deviceSerial, moisturePercentage);
        return Task.CompletedTask;
    }
}
