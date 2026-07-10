using System;
using System.Threading;
using System.Threading.Tasks;
using FLORAX.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FLORAX.Application.Features.IrrigationSchedules;

public record DeleteScheduleCommand : IRequest<bool>
{
    public Guid Id { get; set; }
}

public class DeleteScheduleCommandHandler : IRequestHandler<DeleteScheduleCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public DeleteScheduleCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(DeleteScheduleCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.IrrigationSchedules
            .FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken);

        if (entity == null)
            return false;

        _context.IrrigationSchedules.Remove(entity);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
