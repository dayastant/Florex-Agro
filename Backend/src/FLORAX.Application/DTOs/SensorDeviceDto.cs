using System;
using FLORAX.Application.Common.Mappings;
using FLORAX.Domain.Entities;

namespace FLORAX.Application.DTOs;

public class SensorDeviceDto : IMapFrom<SensorDevice>
{
    public Guid Id { get; set; }
    public Guid ZoneId { get; set; }
    public string DeviceSerial { get; set; }
    public string SensorType { get; set; }
    public string FirmwareVersion { get; set; }
    public int BatteryPercentage { get; set; }
    public int SignalStrength { get; set; }
    public string Status { get; set; }
    public DateTime InstalledAt { get; set; }
}
