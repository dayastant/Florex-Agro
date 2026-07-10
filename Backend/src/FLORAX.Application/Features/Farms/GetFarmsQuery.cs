using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FLORAX.Application.Common.Interfaces;
using FLORAX.Application.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FLORAX.Application.Features.Farms;

public record GetFarmsQuery : IRequest<List<FarmDto>>
{
    public Guid? OwnerId { get; set; }
}

public class GetFarmsQueryHandler : IRequestHandler<GetFarmsQuery, List<FarmDto>>
{
    private readonly IApplicationDbContext _context;

    public GetFarmsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<FarmDto>> Handle(GetFarmsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Farms.AsQueryable();

        if (request.OwnerId.HasValue)
        {
            query = query.Where(f => f.OwnerId == request.OwnerId.Value);
        }

        return await query
            .Select(f => new FarmDto
            {
                Id = f.Id,
                FarmName = f.FarmName,
                District = f.District,
                Province = f.Province,
                Latitude = f.Latitude,
                Longitude = f.Longitude,
                TotalArea = f.TotalArea,
                OwnerId = f.OwnerId
            })
            .ToListAsync(cancellationToken);
    }
}
