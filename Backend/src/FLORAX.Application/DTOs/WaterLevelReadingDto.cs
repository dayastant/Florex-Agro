using System;
using FLORAX.Application.Common.Mappings;
using FLORAX.Domain.Entities;

namespace FLORAX.Application.DTOs;

public class WaterLevelReadingDto : IMapFrom<WaterLevelReading>
{
    public Guid Id { get; set; }
    public Guid TankId { get; set; }
    public decimal WaterLevel { get; set; }
    public DateTime RecordedAt { get; set; }
}
