using System;
using FLORAX.Domain.Common;

namespace FLORAX.Domain.Entities;

public class DeviceStatus : BaseEntity
{
    public Guid DeviceId { get; set; }
    public string DeviceType { get; set; }
    public bool OnlineStatus { get; set; }
    public int Battery { get; set; }
    public int SignalStrength { get; set; }
    public DateTime LastSeen { get; set; }
}
