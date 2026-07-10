using System;
using FLORAX.Domain.Common;

namespace FLORAX.Domain.Entities;

public class TemperatureReading : BaseEntity
{
    public Guid SensorId { get; set; }
    public SensorDevice Sensor { get; set; }

    public decimal Temperature { get; set; }
    public DateTime RecordedAt { get; set; }
}
