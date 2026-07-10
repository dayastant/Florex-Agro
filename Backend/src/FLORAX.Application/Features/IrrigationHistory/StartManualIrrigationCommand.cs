using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FLORAX.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FLORAX.Application.Features.IrrigationHistory;

public record StartManualIrrigationCommand : IRequest<bool>
{
    public Guid ZoneId { get; set; }
    public int DurationMinutes { get; set; }
}

public class StartManualIrrigationCommandHandler : IRequestHandler<StartManualIrrigationCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public StartManualIrrigationCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(StartManualIrrigationCommand request, CancellationToken cancellationToken)
    {
        var zone = await _context.IrrigationZones
            .FirstOrDefaultAsync(z => z.Id == request.ZoneId, cancellationToken);

        if (zone == null) return false;

        // 1. Update zone status
        zone.Status = "Irrigating";

        // 2. Open associated valves
        var valves = await _context.ValveControllers
            .Where(v => v.ZoneId == request.ZoneId)
            .ToListAsync(cancellationToken);

        foreach (var valve in valves)
        {
            valve.State = "Open";
        }

        // 3. Start associated pump motor on the farm
        var motor = await _context.Motors
            .FirstOrDefaultAsync(m => m.FarmId == zone.FarmId, cancellationToken);

        if (motor != null)
        {
            motor.Status = "Running";
        }

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
