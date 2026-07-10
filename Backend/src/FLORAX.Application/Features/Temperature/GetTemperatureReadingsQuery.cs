using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FLORAX.Application.Common.Interfaces;
using FLORAX.Application.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FLORAX.Application.Features.Temperature;

public record GetTemperatureReadingsQuery : IRequest<List<TemperatureReadingDto>>;

public class GetTemperatureReadingsQueryHandler : IRequestHandler<GetTemperatureReadingsQuery, List<TemperatureReadingDto>>
{
    private readonly IApplicationDbContext _context;

    public GetTemperatureReadingsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<TemperatureReadingDto>> Handle(GetTemperatureReadingsQuery request, CancellationToken cancellationToken)
    {
        return await _context.TemperatureReadings
            .Select(t => new TemperatureReadingDto
            {
                Id = t.Id,
                SensorId = t.SensorId,
                Temperature = t.Temperature,
                RecordedAt = t.RecordedAt
            })
            .ToListAsync(cancellationToken);
    }
}
