using System;
using System.Threading;
using System.Threading.Tasks;
using FLORAX.Application.Common.Interfaces;
using FLORAX.Domain.Entities;
using MediatR;

namespace FLORAX.Application.Features.IrrigationZones;

public record CreateZoneCommand : IRequest<Guid>
{
    public Guid FarmId { get; set; }
    public string ZoneName { get; set; } = null!;
    public string CropType { get; set; } = null!;
    public string SoilType { get; set; } = null!;
    public decimal Area { get; set; }
    public string Status { get; set; } = null!;
}

public class CreateZoneCommandHandler : IRequestHandler<CreateZoneCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateZoneCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateZoneCommand request, CancellationToken cancellationToken)
    {
        var entity = new IrrigationZone
        {
            FarmId = request.FarmId,
            ZoneName = request.ZoneName,
            CropType = request.CropType,
            SoilType = request.SoilType,
            Area = request.Area,
            Status = request.Status,
            CreatedBy = "System",
            LastModifiedBy = "System"
        };

        _context.IrrigationZones.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
