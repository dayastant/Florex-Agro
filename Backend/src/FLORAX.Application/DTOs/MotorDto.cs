using System;
using FLORAX.Application.Common.Mappings;
using FLORAX.Domain.Entities;

namespace FLORAX.Application.DTOs;

public class MotorDto : IMapFrom<Motor>
{
    public Guid Id { get; set; }
    public Guid FarmId { get; set; }
    public string MotorName { get; set; }
    public string PowerRating { get; set; }
    public string Status { get; set; }
    public decimal RuntimeHours { get; set; }
}
