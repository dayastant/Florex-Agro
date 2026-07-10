using System;
using FLORAX.Application.Common.Mappings;
using FLORAX.Domain.Entities;

namespace FLORAX.Application.DTOs;

public class SolarBatteryStatusDto : IMapFrom<SolarBatteryStatus>
{
    public Guid Id { get; set; }
    public Guid FarmId { get; set; }
    public int BatteryPercentage { get; set; }
    public decimal SolarVoltage { get; set; }
    public bool Charging { get; set; }
    public DateTime RecordedAt { get; set; }
}
