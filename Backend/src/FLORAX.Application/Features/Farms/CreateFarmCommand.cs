using System;
using System.Threading;
using System.Threading.Tasks;
using FLORAX.Application.Common.Interfaces;
using FLORAX.Domain.Entities;
using MediatR;

namespace FLORAX.Application.Features.Farms;

public record CreateFarmCommand : IRequest<Guid>
{
    public string FarmName { get; set; }
    public string District { get; set; }
    public string Province { get; set; }
    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }
    public decimal TotalArea { get; set; }
    public Guid OwnerId { get; set; }
}

public class CreateFarmCommandHandler : IRequestHandler<CreateFarmCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateFarmCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateFarmCommand request, CancellationToken cancellationToken)
    {
        var entity = new Farm
        {
            FarmName = request.FarmName,
            District = request.District,
            Province = request.Province,
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            TotalArea = request.TotalArea,
            OwnerId = request.OwnerId,
            CreatedBy = "System",
            LastModifiedBy = "System"
        };

        _context.Farms.Add(entity);

        await _context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
