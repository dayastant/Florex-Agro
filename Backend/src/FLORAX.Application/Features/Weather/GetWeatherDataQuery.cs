using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FLORAX.Application.Common.Interfaces;
using FLORAX.Application.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FLORAX.Application.Features.Weather;

public record GetWeatherDataQuery : IRequest<List<WeatherDataDto>>;

public class GetWeatherDataQueryHandler : IRequestHandler<GetWeatherDataQuery, List<WeatherDataDto>>
{
    private readonly IApplicationDbContext _context;

    public GetWeatherDataQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<WeatherDataDto>> Handle(GetWeatherDataQuery request, CancellationToken cancellationToken)
    {
        return await _context.WeatherDatas
            .Select(w => new WeatherDataDto
            {
                Id = w.Id,
                FarmId = w.FarmId,
                Temperature = w.Temperature,
                Humidity = w.Humidity,
                Rainfall = w.Rainfall,
                WindSpeed = w.WindSpeed,
                WeatherCondition = w.WeatherCondition,
                RecordedAt = w.RecordedAt
            })
            .ToListAsync(cancellationToken);
    }
}
