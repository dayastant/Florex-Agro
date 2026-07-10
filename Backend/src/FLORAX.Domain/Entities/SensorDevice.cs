using System;
using System.Collections.Generic;
using FLORAX.Domain.Common;

namespace FLORAX.Domain.Entities;

public class SensorDevice : BaseEntity
{
    public Guid ZoneId { get; set; }
    public IrrigationZone Zone { get; set; }

    public string DeviceSerial { get; set; }
    public string SensorType { get; set; }
    public string FirmwareVersion { get; set; }
    public int BatteryPercentage { get; set; }
    public int SignalStrength { get; set; }
    public string Status { get; set; }
    public DateTime InstalledAt { get; set; }

    public ICollection<SoilMoistureReading> SoilMoistureReadings { get; set; } = new List<SoilMoistureReading>();
    public ICollection<TemperatureReading> TemperatureReadings { get; set; } = new List<TemperatureReading>();
    public ICollection<HumidityReading> HumidityReadings { get; set; } = new List<HumidityReading>();
}
