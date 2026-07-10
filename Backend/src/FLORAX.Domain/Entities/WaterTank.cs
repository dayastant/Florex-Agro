using System;
using System.Collections.Generic;
using FLORAX.Domain.Common;

namespace FLORAX.Domain.Entities;

public class WaterTank : BaseEntity
{
    public Guid FarmId { get; set; }
    public Farm Farm { get; set; }

    public string TankName { get; set; }
    public decimal CapacityLiters { get; set; }
    public decimal CurrentLevel { get; set; }
    public string Status { get; set; }

    public ICollection<WaterLevelReading> WaterLevelReadings { get; set; } = new List<WaterLevelReading>();
}
