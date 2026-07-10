using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FLORAX.Application.Common.Interfaces;
using FLORAX.Application.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FLORAX.Application.Features.SoilMoisture;

public record GetMoistureReadingsQuery(Guid ZoneId) : IRequest<List<SoilMoistureReadingDto>>;

public class GetMoistureReadingsQueryHandler : IRequestHandler<GetMoistureReadingsQuery, List<SoilMoistureReadingDto>>
{
    private readonly IApplicationDbContext _context;

    public GetMoistureReadingsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<SoilMoistureReadingDto>> Handle(GetMoistureReadingsQuery request, CancellationToken cancellationToken)
    {
        return await _context.SoilMoistureReadings
            .Where(r => r.ZoneId == request.ZoneId)
            .OrderByDescending(r => r.RecordedAt)
            .Take(100)
            .Select(r => new SoilMoistureReadingDto
            {
                Id = r.Id,
                SensorId = r.SensorId,
                ZoneId = r.ZoneId,
                MoisturePercentage = r.MoisturePercentage,
                RecordedAt = r.RecordedAt
            })
            .ToListAsync(cancellationToken);
    }
}
