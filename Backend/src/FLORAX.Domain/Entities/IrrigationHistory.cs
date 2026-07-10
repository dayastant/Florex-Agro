using System;
using FLORAX.Domain.Common;

namespace FLORAX.Domain.Entities;

public class IrrigationHistory : BaseEntity
{
    public Guid ScheduleId { get; set; }
    public IrrigationSchedule Schedule { get; set; }

    public Guid ZoneId { get; set; }
    public IrrigationZone Zone { get; set; }

    public Guid ValveId { get; set; }
    public ValveController Valve { get; set; }

    public Guid MotorId { get; set; }
    public Motor Motor { get; set; }

    public DateTime StartedAt { get; set; }
    public DateTime EndedAt { get; set; }
    public decimal WaterUsed { get; set; }
    public string Status { get; set; }
}
