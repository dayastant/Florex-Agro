using System;
using FLORAX.Application.Common.Mappings;
using FLORAX.Domain.Entities;

namespace FLORAX.Application.DTOs;

public class TemperatureReadingDto : IMapFrom<TemperatureReading>
{
    public Guid Id { get; set; }
    public Guid SensorId { get; set; }
    public decimal Temperature { get; set; }
    public DateTime RecordedAt { get; set; }
}
