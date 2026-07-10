using System;
using FLORAX.Domain.Common;

namespace FLORAX.Domain.Entities;

public class WaterLevelReading : BaseEntity
{
    public Guid TankId { get; set; }
    public WaterTank Tank { get; set; }

    public decimal WaterLevel { get; set; }
    public DateTime RecordedAt { get; set; }
}
