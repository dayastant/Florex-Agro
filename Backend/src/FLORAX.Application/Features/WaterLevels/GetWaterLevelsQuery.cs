using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FLORAX.Application.Common.Interfaces;
using FLORAX.Application.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FLORAX.Application.Features.WaterLevels;

public record GetWaterLevelsQuery : IRequest<List<WaterLevelReadingDto>>;

public class GetWaterLevelsQueryHandler : IRequestHandler<GetWaterLevelsQuery, List<WaterLevelReadingDto>>
{
    private readonly IApplicationDbContext _context;

    public GetWaterLevelsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<WaterLevelReadingDto>> Handle(GetWaterLevelsQuery request, CancellationToken cancellationToken)
    {
        return await _context.WaterLevelReadings
            .Select(w => new WaterLevelReadingDto
            {
                Id = w.Id,
                TankId = w.TankId,
                WaterLevel = w.WaterLevel,
                RecordedAt = w.RecordedAt
            })
            .ToListAsync(cancellationToken);
    }
}
