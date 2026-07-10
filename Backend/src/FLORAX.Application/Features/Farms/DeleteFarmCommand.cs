using System;
using System.Threading;
using System.Threading.Tasks;
using FLORAX.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FLORAX.Application.Features.Farms;

public record DeleteFarmCommand : IRequest<bool>
{
    public Guid Id { get; set; }
}

public class DeleteFarmCommandHandler : IRequestHandler<DeleteFarmCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public DeleteFarmCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(DeleteFarmCommand request, CancellationToken cancellationToken)
    {
        var farm = await _context.Farms.FirstOrDefaultAsync(f => f.Id == request.Id, cancellationToken);
        if (farm == null)
            return false;

        _context.Farms.Remove(farm);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
