using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FLORAX.Application.Common.Interfaces;
using FLORAX.Application.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FLORAX.Application.Features.ValveControllers;

public record GetValveControllersQuery : IRequest<List<ValveControllerDto>>;

public class GetValveControllersQueryHandler : IRequestHandler<GetValveControllersQuery, List<ValveControllerDto>>
{
    private readonly IApplicationDbContext _context;

    public GetValveControllersQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ValveControllerDto>> Handle(GetValveControllersQuery request, CancellationToken cancellationToken)
    {
        return await _context.ValveControllers
            .Select(v => new ValveControllerDto
            {
                Id = v.Id,
                ZoneId = v.ZoneId,
                DeviceSerial = v.DeviceSerial,
                State = v.State,
                FlowRate = v.FlowRate
            })
            .ToListAsync(cancellationToken);
    }
}
