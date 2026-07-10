using System;
using System.Collections.Generic;
using FLORAX.Domain.Common;

namespace FLORAX.Domain.Entities;

public class Farm : BaseEntity
{
    public Guid OwnerId { get; set; }
    public User Owner { get; set; }

    public string FarmName { get; set; }
    public string District { get; set; }
    public string Province { get; set; }
    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }
    public decimal TotalArea { get; set; }

    public ICollection<IrrigationZone> IrrigationZones { get; set; } = new List<IrrigationZone>();
    public ICollection<WaterTank> WaterTanks { get; set; } = new List<WaterTank>();
    public ICollection<Motor> Motors { get; set; } = new List<Motor>();
    public ICollection<WeatherData> WeatherData { get; set; } = new List<WeatherData>();
    public ICollection<SolarBatteryStatus> SolarBatteryStatuses { get; set; } = new List<SolarBatteryStatus>();
    public ICollection<WaterUsageReport> WaterUsageReports { get; set; } = new List<WaterUsageReport>();
}
