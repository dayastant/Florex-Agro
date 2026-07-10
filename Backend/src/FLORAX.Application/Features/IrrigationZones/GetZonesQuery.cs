using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FLORAX.Application.Common.Interfaces;
using FLORAX.Application.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FLORAX.Application.Features.IrrigationZones;

public record GetZonesQuery(Guid FarmId) : IRequest<List<IrrigationZoneDto>>;

public class GetZonesQueryHandler : IRequestHandler<GetZonesQuery, List<IrrigationZoneDto>>
{
    private readonly IApplicationDbContext _context;

    public GetZonesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<IrrigationZoneDto>> Handle(GetZonesQuery request, CancellationToken cancellationToken)
    {
        return await _context.IrrigationZones
            .Where(z => z.FarmId == request.FarmId)
            .Select(z => new IrrigationZoneDto
            {
                Id = z.Id,
                FarmId = z.FarmId,
                ZoneName = z.ZoneName,
                CropType = z.CropType,
                SoilType = z.SoilType,
                Area = z.Area,
                Status = z.Status
            })
            .ToListAsync(cancellationToken);
    }
}
