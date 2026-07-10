using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FLORAX.Application.Common.Interfaces;
using FLORAX.Application.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FLORAX.Application.Features.SensorDevices;

public record GetAllSensorDevicesQuery : IRequest<List<SensorDeviceDto>>;

public class GetAllSensorDevicesQueryHandler : IRequestHandler<GetAllSensorDevicesQuery, List<SensorDeviceDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAllSensorDevicesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<SensorDeviceDto>> Handle(GetAllSensorDevicesQuery request, CancellationToken cancellationToken)
    {
        return await _context.SensorDevices
            .Select(d => new SensorDeviceDto
            {
                Id = d.Id,
                ZoneId = d.ZoneId,
                DeviceSerial = d.DeviceSerial,
                SensorType = d.SensorType,
                FirmwareVersion = d.FirmwareVersion,
                BatteryPercentage = d.BatteryPercentage,
                SignalStrength = d.SignalStrength,
                Status = d.Status,
                InstalledAt = d.InstalledAt
            })
            .ToListAsync(cancellationToken);
    }
}
