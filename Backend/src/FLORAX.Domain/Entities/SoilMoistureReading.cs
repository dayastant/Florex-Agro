using System;
using FLORAX.Domain.Common;

namespace FLORAX.Domain.Entities;

public class SoilMoistureReading : BaseEntity
{
    public Guid SensorId { get; set; }
    public SensorDevice Sensor { get; set; }

    public Guid ZoneId { get; set; }
    public IrrigationZone Zone { get; set; }

    public decimal MoisturePercentage { get; set; }
    public DateTime RecordedAt { get; set; }
}
