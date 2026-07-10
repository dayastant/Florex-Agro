using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FLORAX.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FLORAX.Application.Features.IrrigationHistory;

public record StopManualIrrigationCommand : IRequest<bool>
{
    public Guid ZoneId { get; set; }
}

public class StopManualIrrigationCommandHandler : IRequestHandler<StopManualIrrigationCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public StopManualIrrigationCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(StopManualIrrigationCommand request, CancellationToken cancellationToken)
    {
        var zone = await _context.IrrigationZones
            .FirstOrDefaultAsync(z => z.Id == request.ZoneId, cancellationToken);

        if (zone == null) return false;

        // 1. Update zone status
        zone.Status = "Idle";

        // 2. Close associated valves
        var valves = await _context.ValveControllers
            .Where(v => v.ZoneId == request.ZoneId)
            .ToListAsync(cancellationToken);

        foreach (var valve in valves)
        {
            valve.State = "Closed";
        }

        // 3. Stop associated pump motor if no other zone on the farm is irrigating
        var otherIrrigating = await _context.IrrigationZones
            .AnyAsync(z => z.FarmId == zone.FarmId && z.Id != request.ZoneId && z.Status == "Irrigating", cancellationToken);

        if (!otherIrrigating)
        {
            var motor = await _context.Motors
                .FirstOrDefaultAsync(m => m.FarmId == zone.FarmId, cancellationToken);

            if (motor != null)
            {
                motor.Status = "Stopped";
            }
        }

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
