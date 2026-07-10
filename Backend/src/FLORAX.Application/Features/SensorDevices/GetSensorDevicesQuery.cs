using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FLORAX.Application.Common.Interfaces;
using FLORAX.Application.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FLORAX.Application.Features.SensorDevices;

public record GetSensorDevicesQuery(Guid ZoneId) : IRequest<List<SensorDeviceDto>>;

public class GetSensorDevicesQueryHandler : IRequestHandler<GetSensorDevicesQuery, List<SensorDeviceDto>>
{
    private readonly IApplicationDbContext _context;

    public GetSensorDevicesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<SensorDeviceDto>> Handle(GetSensorDevicesQuery request, CancellationToken cancellationToken)
    {
        return await _context.SensorDevices
            .Where(s => s.ZoneId == request.ZoneId)
            .Select(s => new SensorDeviceDto
            {
                Id = s.Id,
                ZoneId = s.ZoneId,
                DeviceSerial = s.DeviceSerial,
                SensorType = s.SensorType,
                FirmwareVersion = s.FirmwareVersion,
                Status = s.Status
            })
            .ToListAsync(cancellationToken);
    }
}
