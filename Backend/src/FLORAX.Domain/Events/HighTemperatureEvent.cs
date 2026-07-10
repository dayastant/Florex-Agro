using FLORAX.Domain.Common;
using FLORAX.Domain.Entities;

namespace FLORAX.Domain.Events;

public class HighTemperatureEvent : BaseEvent
{
    public SensorDevice Sensor { get; }
    public decimal Temperature { get; }

    public HighTemperatureEvent(SensorDevice sensor, decimal temperature)
    {
        Sensor = sensor;
        Temperature = temperature;
    }
}
