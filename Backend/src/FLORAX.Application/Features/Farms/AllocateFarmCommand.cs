using System;
using System.Threading;
using System.Threading.Tasks;
using FLORAX.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FLORAX.Application.Features.Farms;

public record AllocateFarmCommand : IRequest<bool>
{
    public Guid FarmId { get; set; }
    public Guid OwnerId { get; set; }
}

public class AllocateFarmCommandHandler : IRequestHandler<AllocateFarmCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public AllocateFarmCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(AllocateFarmCommand request, CancellationToken cancellationToken)
    {
        var farm = await _context.Farms.FirstOrDefaultAsync(f => f.Id == request.FarmId, cancellationToken);
        if (farm == null)
            return false;

        farm.OwnerId = request.OwnerId;
        farm.LastModifiedBy = "System";
        farm.LastModified = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
