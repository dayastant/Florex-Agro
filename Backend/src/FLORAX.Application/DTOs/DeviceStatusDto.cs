using System;
using FLORAX.Application.Common.Mappings;
using FLORAX.Domain.Entities;

namespace FLORAX.Application.DTOs;

public class DeviceStatusDto : IMapFrom<DeviceStatus>
{
    public Guid Id { get; set; }
    public Guid DeviceId { get; set; }
    public string DeviceType { get; set; }
    public bool OnlineStatus { get; set; }
    public int Battery { get; set; }
    public int SignalStrength { get; set; }
    public DateTime LastSeen { get; set; }
}
