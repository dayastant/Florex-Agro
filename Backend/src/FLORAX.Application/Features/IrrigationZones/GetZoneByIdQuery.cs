using System;
using System.Threading;
using System.Threading.Tasks;
using FLORAX.Application.Common.Interfaces;
using FLORAX.Application.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FLORAX.Application.Features.IrrigationZones;

public record GetZoneByIdQuery(Guid Id) : IRequest<IrrigationZoneDto>;

public class GetZoneByIdQueryHandler : IRequestHandler<GetZoneByIdQuery, IrrigationZoneDto>
{
    private readonly IApplicationDbContext _context;

    public GetZoneByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IrrigationZoneDto> Handle(GetZoneByIdQuery request, CancellationToken cancellationToken)
    {
        var z = await _context.IrrigationZones
            .FirstOrDefaultAsync(z => z.Id == request.Id, cancellationToken);

        if (z == null) return null;

        return new IrrigationZoneDto
        {
            Id = z.Id,
            FarmId = z.FarmId,
            ZoneName = z.ZoneName,
            CropType = z.CropType,
            SoilType = z.SoilType,
            Area = z.Area,
            Status = z.Status
        };
    }
}
