using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FLORAX.Application.Common.Interfaces;
using FLORAX.Application.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FLORAX.Application.Features.WaterTanks;

public record GetWaterTanksQuery : IRequest<List<WaterTankDto>>;

public class GetWaterTanksQueryHandler : IRequestHandler<GetWaterTanksQuery, List<WaterTankDto>>
{
    private readonly IApplicationDbContext _context;

    public GetWaterTanksQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<WaterTankDto>> Handle(GetWaterTanksQuery request, CancellationToken cancellationToken)
    {
        return await _context.WaterTanks
            .Select(t => new WaterTankDto
            {
                Id = t.Id,
                FarmId = t.FarmId,
                TankName = t.TankName,
                CapacityLiters = t.CapacityLiters,
                CurrentLevel = t.CurrentLevel,
                Status = t.Status
            })
            .ToListAsync(cancellationToken);
    }
}
