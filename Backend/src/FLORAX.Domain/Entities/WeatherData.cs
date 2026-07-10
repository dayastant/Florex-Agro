using System;
using FLORAX.Domain.Common;

namespace FLORAX.Domain.Entities;

public class WeatherData : BaseEntity
{
    public Guid FarmId { get; set; }
    public Farm Farm { get; set; }

    public decimal Temperature { get; set; }
    public decimal Humidity { get; set; }
    public decimal Rainfall { get; set; }
    public decimal WindSpeed { get; set; }
    public string WeatherCondition { get; set; }
    public DateTime RecordedAt { get; set; }
}
