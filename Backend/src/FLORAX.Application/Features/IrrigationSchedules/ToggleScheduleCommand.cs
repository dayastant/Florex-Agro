using System;
using System.Threading;
using System.Threading.Tasks;
using FLORAX.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FLORAX.Application.Features.IrrigationSchedules;

public record ToggleScheduleCommand : IRequest<bool>
{
    public Guid Id { get; set; }
    public bool IsEnabled { get; set; }
}

public class ToggleScheduleCommandHandler : IRequestHandler<ToggleScheduleCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public ToggleScheduleCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(ToggleScheduleCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.IrrigationSchedules
            .FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken);

        if (entity == null)
            return false;

        entity.Enabled = request.IsEnabled;
        entity.LastModified = DateTime.UtcNow;
        entity.LastModifiedBy = "System";

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
