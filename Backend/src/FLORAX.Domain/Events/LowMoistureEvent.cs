using FLORAX.Domain.Common;
using FLORAX.Domain.Entities;

namespace FLORAX.Domain.Events;

public class LowMoistureEvent : BaseEvent
{
    public SensorDevice Sensor { get; }
    public decimal MoisturePercentage { get; }

    public LowMoistureEvent(SensorDevice sensor, decimal moisturePercentage)
    {
        Sensor = sensor;
        MoisturePercentage = moisturePercentage;
    }
}
