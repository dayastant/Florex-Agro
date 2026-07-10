using System;
using System.Threading;
using System.Threading.Tasks;
using FLORAX.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FLORAX.Application.Features.IrrigationZones;

public record UpdateZoneStatusCommand : IRequest<bool>
{
    public Guid Id { get; set; }
    public string Status { get; set; } = null!;
}

public class UpdateZoneStatusCommandHandler : IRequestHandler<UpdateZoneStatusCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public UpdateZoneStatusCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(UpdateZoneStatusCommand request, CancellationToken cancellationToken)
    {
        var zone = await _context.IrrigationZones
            .FirstOrDefaultAsync(z => z.Id == request.Id, cancellationToken);

        if (zone == null)
            return false;

        zone.Status = request.Status;
        
        // Ensure audit fields are set
        zone.LastModified = DateTime.UtcNow;
        zone.LastModifiedBy = "System";

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
