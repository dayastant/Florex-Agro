using System;
using System.Collections.Generic;
using FLORAX.Domain.Common;

namespace FLORAX.Domain.Entities;

public class ValveController : BaseEntity
{
    public Guid ZoneId { get; set; }
    public IrrigationZone Zone { get; set; }

    public string DeviceSerial { get; set; }
    public string State { get; set; }
    public decimal FlowRate { get; set; }

    public ICollection<IrrigationHistory> IrrigationHistories { get; set; } = new List<IrrigationHistory>();
}
