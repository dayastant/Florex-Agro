using System;
using FLORAX.Application.Common.Mappings;
using FLORAX.Domain.Entities;

namespace FLORAX.Application.DTOs;

public class HumidityReadingDto : IMapFrom<HumidityReading>
{
    public Guid Id { get; set; }
    public Guid SensorId { get; set; }
    public decimal Humidity { get; set; }
    public DateTime RecordedAt { get; set; }
}
