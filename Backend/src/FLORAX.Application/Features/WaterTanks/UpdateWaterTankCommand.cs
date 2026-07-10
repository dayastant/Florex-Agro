using System;
using System.Threading;
using System.Threading.Tasks;
using FLORAX.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FLORAX.Application.Features.WaterTanks;

public record UpdateWaterTankCommand : IRequest<bool>
{
    public Guid Id { get; set; }
    public string TankName { get; set; }
    public decimal CapacityLiters { get; set; }
    public decimal CurrentLevel { get; set; }
    public string Status { get; set; }
}

public class UpdateWaterTankCommandHandler : IRequestHandler<UpdateWaterTankCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public UpdateWaterTankCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(UpdateWaterTankCommand request, CancellationToken cancellationToken)
    {
        var tank = await _context.WaterTanks.FirstOrDefaultAsync(w => w.Id == request.Id, cancellationToken);
        if (tank == null)
            return false;

        tank.TankName = request.TankName;
        tank.CapacityLiters = request.CapacityLiters;
        tank.CurrentLevel = request.CurrentLevel;
        tank.Status = request.Status;
        tank.LastModifiedBy = "System";
        tank.LastModified = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
