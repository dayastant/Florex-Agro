using System;
using System.Threading;
using System.Threading.Tasks;
using FLORAX.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FLORAX.Application.Features.IrrigationZones;

public record UpdateZoneCommand : IRequest<bool>
{
    public Guid Id { get; set; }
    public string ZoneName { get; set; } = null!;
    public string CropType { get; set; }
    public string SoilType { get; set; }
    public decimal Area { get; set; }
}

public class UpdateZoneCommandHandler : IRequestHandler<UpdateZoneCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public UpdateZoneCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(UpdateZoneCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.IrrigationZones
            .FirstOrDefaultAsync(z => z.Id == request.Id, cancellationToken);

        if (entity == null)
            return false;

        entity.ZoneName = request.ZoneName;
        entity.CropType = request.CropType;
        entity.SoilType = request.SoilType;
        entity.Area = request.Area;
        entity.LastModified = DateTime.UtcNow;
        entity.LastModifiedBy = "System";

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
