using System;
using System.Threading;
using System.Threading.Tasks;
using FLORAX.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FLORAX.Application.Features.IrrigationZones;

public record DeleteZoneCommand : IRequest<bool>
{
    public Guid Id { get; set; }
}

public class DeleteZoneCommandHandler : IRequestHandler<DeleteZoneCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public DeleteZoneCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(DeleteZoneCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.IrrigationZones
            .FirstOrDefaultAsync(z => z.Id == request.Id, cancellationToken);

        if (entity == null)
            return false;

        _context.IrrigationZones.Remove(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
