using System;
using System.Threading;
using System.Threading.Tasks;
using FLORAX.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FLORAX.Application.Features.WaterTanks;

public record DeleteWaterTankCommand : IRequest<bool>
{
    public Guid Id { get; set; }
}

public class DeleteWaterTankCommandHandler : IRequestHandler<DeleteWaterTankCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public DeleteWaterTankCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(DeleteWaterTankCommand request, CancellationToken cancellationToken)
    {
        var tank = await _context.WaterTanks.FirstOrDefaultAsync(w => w.Id == request.Id, cancellationToken);
        if (tank == null)
            return false;

        _context.WaterTanks.Remove(tank);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
