using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace FLORAX.Infrastructure.MQTT;

public class MqttClientService
{
    private readonly ILogger<MqttClientService> _logger;

    public MqttClientService(ILogger<MqttClientService> logger)
    {
        _logger = logger;
    }

    public Task PublishAsync(string topic, string payload)
    {
        _logger.LogInformation("MQTT Publish to topic '{Topic}': {Payload}", topic, payload);
        return Task.CompletedTask;
    }

    public Task SubscribeAsync(string topic)
    {
        _logger.LogInformation("MQTT Subscribed to topic '{Topic}'", topic);
        return Task.CompletedTask;
    }
}
