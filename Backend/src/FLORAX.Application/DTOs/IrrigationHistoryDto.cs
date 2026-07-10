using System;
using FLORAX.Application.Common.Mappings;
using FLORAX.Domain.Entities;

namespace FLORAX.Application.DTOs;

public class IrrigationHistoryDto : IMapFrom<IrrigationHistory>
{
    public Guid Id { get; set; }
    public Guid ScheduleId { get; set; }
    public Guid ZoneId { get; set; }
    public Guid ValveId { get; set; }
    public Guid MotorId { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime EndedAt { get; set; }
    public decimal WaterUsed { get; set; }
    public string Status { get; set; }
}
