using System;
using System.Threading;
using System.Threading.Tasks;
using FLORAX.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FLORAX.Application.Features.ValveControllers;

public record UpdateValveControllerCommand : IRequest<bool>
{
    public Guid Id { get; set; }
    public bool IsOpen { get; set; }
}

public class UpdateValveControllerCommandHandler : IRequestHandler<UpdateValveControllerCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public UpdateValveControllerCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(UpdateValveControllerCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.ValveControllers
            .FirstOrDefaultAsync(v => v.Id == request.Id, cancellationToken);

        if (entity == null)
            return false;

        entity.State = request.IsOpen ? "Open" : "Closed";
        entity.LastModified = DateTime.UtcNow;
        entity.LastModifiedBy = "System";

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
