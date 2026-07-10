using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FLORAX.Application.Common.Interfaces;
using FLORAX.Application.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FLORAX.Application.Features.Motors;

public record GetMotorsQuery : IRequest<List<MotorDto>>;

public class GetMotorsQueryHandler : IRequestHandler<GetMotorsQuery, List<MotorDto>>
{
    private readonly IApplicationDbContext _context;

    public GetMotorsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<MotorDto>> Handle(GetMotorsQuery request, CancellationToken cancellationToken)
    {
        return await _context.Motors
            .Select(m => new MotorDto
            {
                Id = m.Id,
                FarmId = m.FarmId,
                MotorName = m.MotorName,
                PowerRating = m.PowerRating,
                Status = m.Status,
                RuntimeHours = m.RuntimeHours
            })
            .ToListAsync(cancellationToken);
    }
}
