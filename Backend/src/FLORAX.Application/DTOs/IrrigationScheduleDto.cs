using System;
using FLORAX.Application.Common.Mappings;
using FLORAX.Domain.Entities;

namespace FLORAX.Application.DTOs;

public class IrrigationScheduleDto : IMapFrom<IrrigationSchedule>
{
    public Guid Id { get; set; }
    public Guid ZoneId { get; set; }
    public Guid CreatedBy { get; set; }
    public TimeSpan StartTime { get; set; }
    public int DurationMinutes { get; set; }
    public string RepeatType { get; set; }
    public bool Enabled { get; set; }
}
