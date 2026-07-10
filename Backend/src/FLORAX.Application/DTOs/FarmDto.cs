using System;
using FLORAX.Application.Common.Mappings;
using FLORAX.Domain.Entities;

namespace FLORAX.Application.DTOs;

public class FarmDto : IMapFrom<Farm>
{
    public Guid Id { get; set; }
    public string FarmName { get; set; }
    public string District { get; set; }
    public string Province { get; set; }
    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }
    public decimal TotalArea { get; set; }
    public Guid OwnerId { get; set; }
}
