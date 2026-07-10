using System;
using FLORAX.Domain.Common;

namespace FLORAX.Domain.Entities;

public class HumidityReading : BaseEntity
{
    public Guid SensorId { get; set; }
    public SensorDevice Sensor { get; set; }

    public decimal Humidity { get; set; }
    public DateTime RecordedAt { get; set; }
}
