using System;
using FLORAX.Application.Common.Mappings;
using FLORAX.Domain.Entities;

namespace FLORAX.Application.DTOs;

public class WeatherDataDto : IMapFrom<WeatherData>
{
    public Guid Id { get; set; }
    public Guid FarmId { get; set; }
    public decimal Temperature { get; set; }
    public decimal Humidity { get; set; }
    public decimal Rainfall { get; set; }
    public decimal WindSpeed { get; set; }
    public string WeatherCondition { get; set; }
    public DateTime RecordedAt { get; set; }
}
