using System;
using FLORAX.Application.Common.Mappings;
using FLORAX.Domain.Entities;

namespace FLORAX.Application.DTOs;

public class WaterTankDto : IMapFrom<WaterTank>
{
    public Guid Id { get; set; }
    public Guid FarmId { get; set; }
    public string TankName { get; set; }
    public decimal CapacityLiters { get; set; }
    public decimal CurrentLevel { get; set; }
    public string Status { get; set; }
}
