using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FLORAX.Application.Common.Interfaces;
using FLORAX.Application.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FLORAX.Application.Features.Reports;

public record GetReportsQuery : IRequest<List<WaterUsageReportDto>>;

public class GetReportsQueryHandler : IRequestHandler<GetReportsQuery, List<WaterUsageReportDto>>
{
    private readonly IApplicationDbContext _context;

    public GetReportsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<WaterUsageReportDto>> Handle(GetReportsQuery request, CancellationToken cancellationToken)
    {
        return await _context.WaterUsageReports
            .Select(r => new WaterUsageReportDto
            {
                Id = r.Id,
                ZoneId = r.ZoneId,
                FarmId = r.FarmId,
                ReportDate = r.ReportDate,
                TotalWaterUsed = r.TotalWaterUsed,
                AverageMoisture = r.AverageMoisture,
                IrrigationCount = r.IrrigationCount
            })
            .ToListAsync(cancellationToken);
    }
}
