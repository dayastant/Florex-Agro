using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FLORAX.Application.Common.Interfaces;
using FLORAX.Application.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FLORAX.Application.Features.IrrigationSchedules;

public record GetSchedulesQuery(Guid ZoneId) : IRequest<List<IrrigationScheduleDto>>;

public class GetSchedulesQueryHandler : IRequestHandler<GetSchedulesQuery, List<IrrigationScheduleDto>>
{
    private readonly IApplicationDbContext _context;

    public GetSchedulesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<IrrigationScheduleDto>> Handle(GetSchedulesQuery request, CancellationToken cancellationToken)
    {
        return await _context.IrrigationSchedules
            .Where(s => s.ZoneId == request.ZoneId)
            .Select(s => new IrrigationScheduleDto
            {
                Id = s.Id,
                ZoneId = s.ZoneId,
                CreatedBy = s.CreatedBy,
                StartTime = s.StartTime,
                DurationMinutes = s.DurationMinutes,
                RepeatType = s.RepeatType,
                Enabled = s.Enabled
            })
            .ToListAsync(cancellationToken);
    }
}
