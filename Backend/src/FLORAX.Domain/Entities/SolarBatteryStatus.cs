using System;
using FLORAX.Domain.Common;

namespace FLORAX.Domain.Entities;

public class SolarBatteryStatus : BaseEntity
{
    public Guid FarmId { get; set; }
    public Farm Farm { get; set; }

    public int BatteryPercentage { get; set; }
    public decimal SolarVoltage { get; set; }
    public bool Charging { get; set; }
    public DateTime RecordedAt { get; set; }
}
