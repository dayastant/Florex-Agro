using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FLORAX.Application.Common.Interfaces;
using FLORAX.Application.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FLORAX.Application.Features.Dashboard;

public record GetDashboardSummaryQuery : IRequest<DashboardSummaryDto>;

public class GetDashboardSummaryQueryHandler : IRequestHandler<GetDashboardSummaryQuery, DashboardSummaryDto>
{
    private readonly IApplicationDbContext _context;

    public GetDashboardSummaryQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardSummaryDto> Handle(GetDashboardSummaryQuery request, CancellationToken cancellationToken)
    {
        var totalFarms = await _context.Farms.CountAsync(cancellationToken);
        var totalZones = await _context.IrrigationZones.CountAsync(cancellationToken);
        var activeSensors = await _context.SensorDevices.CountAsync(s => s.Status == "Active" || s.Status == "Online", cancellationToken);

        var averageMoisture = await _context.SoilMoistureReadings
            .Select(r => (decimal?)r.MoisturePercentage)
            .DefaultIfEmpty()
            .AverageAsync(cancellationToken);

        var systemStatus = totalFarms > 0 && totalZones > 0
            ? "Healthy"
            : "Needs Setup";

        return new DashboardSummaryDto
        {
            TotalFarms = totalFarms,
            TotalZones = totalZones,
            ActiveSensors = activeSensors,
            AverageMoisture = averageMoisture ?? 0m,
            SystemStatus = systemStatus
        };
    }
}
