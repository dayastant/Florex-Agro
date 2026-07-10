using System;
using System.Collections.Generic;
using FLORAX.Domain.Common;

namespace FLORAX.Domain.Entities;

public class IrrigationSchedule : BaseEntity
{
    public Guid ZoneId { get; set; }
    public IrrigationZone Zone { get; set; }

    public Guid CreatedBy { get; set; }
    public User Creator { get; set; }

    public TimeSpan StartTime { get; set; }
    public int DurationMinutes { get; set; }
    public string RepeatType { get; set; }
    public bool Enabled { get; set; }

    public ICollection<IrrigationHistory> IrrigationHistories { get; set; } = new List<IrrigationHistory>();
}
