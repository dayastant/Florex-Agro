using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FLORAX.Application.Common.Interfaces;
using FLORAX.Application.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FLORAX.Application.Features.SolarBattery;

public record GetSolarBatteryStatusQuery : IRequest<List<SolarBatteryStatusDto>>;

public class GetSolarBatteryStatusQueryHandler : IRequestHandler<GetSolarBatteryStatusQuery, List<SolarBatteryStatusDto>>
{
    private readonly IApplicationDbContext _context;

    public GetSolarBatteryStatusQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<SolarBatteryStatusDto>> Handle(GetSolarBatteryStatusQuery request, CancellationToken cancellationToken)
    {
        return await _context.SolarBatteryStatuses
            .Select(s => new SolarBatteryStatusDto
            {
                Id = s.Id,
                FarmId = s.FarmId,
                BatteryPercentage = s.BatteryPercentage,
                SolarVoltage = s.SolarVoltage,
                Charging = s.Charging,
                RecordedAt = s.RecordedAt
            })
            .ToListAsync(cancellationToken);
    }
}
