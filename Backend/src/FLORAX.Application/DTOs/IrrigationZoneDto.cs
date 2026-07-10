using System;
using FLORAX.Application.Common.Mappings;
using FLORAX.Domain.Entities;

namespace FLORAX.Application.DTOs;

public class IrrigationZoneDto : IMapFrom<IrrigationZone>
{
    public Guid Id { get; set; }
    public Guid FarmId { get; set; }
    public string ZoneName { get; set; }
    public string CropType { get; set; }
    public string SoilType { get; set; }
    public decimal Area { get; set; }
    public string Status { get; set; }
}
