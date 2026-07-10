using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FLORAX.Application.Common.Interfaces;
using FLORAX.Application.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FLORAX.Application.Features.IrrigationSchedules;

public record GetAllSchedulesQuery : IRequest<List<IrrigationScheduleDto>>;

public class GetAllSchedulesQueryHandler : IRequestHandler<GetAllSchedulesQuery, List<IrrigationScheduleDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAllSchedulesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<IrrigationScheduleDto>> Handle(GetAllSchedulesQuery request, CancellationToken cancellationToken)
    {
        return await _context.IrrigationSchedules
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
