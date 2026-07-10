using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FLORAX.Application.Common.Interfaces;
using FLORAX.Application.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FLORAX.Application.Features.DeviceStatus;

public record GetDeviceStatusQuery : IRequest<List<DeviceStatusDto>>;

public class GetDeviceStatusQueryHandler : IRequestHandler<GetDeviceStatusQuery, List<DeviceStatusDto>>
{
    private readonly IApplicationDbContext _context;

    public GetDeviceStatusQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<DeviceStatusDto>> Handle(GetDeviceStatusQuery request, CancellationToken cancellationToken)
    {
        return await _context.DeviceStatuses
            .Select(d => new DeviceStatusDto
            {
                Id = d.Id,
                DeviceId = d.DeviceId,
                DeviceType = d.DeviceType,
                OnlineStatus = d.OnlineStatus,
                Battery = d.Battery,
                SignalStrength = d.SignalStrength,
                LastSeen = d.LastSeen
            })
            .ToListAsync(cancellationToken);
    }
}
