using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FLORAX.Application.Common.Interfaces;
using FLORAX.Application.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FLORAX.Application.Features.Humidity;

public record GetHumidityReadingsQuery : IRequest<List<HumidityReadingDto>>;

public class GetHumidityReadingsQueryHandler : IRequestHandler<GetHumidityReadingsQuery, List<HumidityReadingDto>>
{
    private readonly IApplicationDbContext _context;

    public GetHumidityReadingsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<HumidityReadingDto>> Handle(GetHumidityReadingsQuery request, CancellationToken cancellationToken)
    {
        return await _context.HumidityReadings
            .Select(h => new HumidityReadingDto
            {
                Id = h.Id,
                SensorId = h.SensorId,
                Humidity = h.Humidity,
                RecordedAt = h.RecordedAt
            })
            .ToListAsync(cancellationToken);
    }
}
