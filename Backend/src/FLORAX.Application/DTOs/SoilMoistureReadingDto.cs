using System;
using FLORAX.Application.Common.Mappings;
using FLORAX.Domain.Entities;

namespace FLORAX.Application.DTOs;

public class SoilMoistureReadingDto : IMapFrom<SoilMoistureReading>
{
    public Guid Id { get; set; }
    public Guid SensorId { get; set; }
    public Guid ZoneId { get; set; }
    public decimal MoisturePercentage { get; set; }
    public DateTime RecordedAt { get; set; }
}
