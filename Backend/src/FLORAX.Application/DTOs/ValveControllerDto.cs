using System;
using FLORAX.Application.Common.Mappings;
using FLORAX.Domain.Entities;

namespace FLORAX.Application.DTOs;

public class ValveControllerDto : IMapFrom<ValveController>
{
    public Guid Id { get; set; }
    public Guid ZoneId { get; set; }
    public string DeviceSerial { get; set; }
    public string State { get; set; }
    public decimal FlowRate { get; set; }
}
