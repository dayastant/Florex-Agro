using System;
using System.Threading;
using System.Threading.Tasks;
using FLORAX.Application.Common.Interfaces;
using FLORAX.Domain.Entities;
using MediatR;

namespace FLORAX.Application.Features.WaterTanks;

public record CreateWaterTankCommand : IRequest<Guid>
{
    public Guid FarmId { get; set; }
    public string TankName { get; set; }
    public decimal CapacityLiters { get; set; }
    public decimal CurrentLevel { get; set; }
    public string Status { get; set; }
}

public class CreateWaterTankCommandHandler : IRequestHandler<CreateWaterTankCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateWaterTankCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateWaterTankCommand request, CancellationToken cancellationToken)
    {
        var tank = new WaterTank
        {
            FarmId = request.FarmId,
            TankName = request.TankName,
            CapacityLiters = request.CapacityLiters,
            CurrentLevel = request.CurrentLevel,
            Status = request.Status,
            CreatedBy = "System",
            LastModifiedBy = "System"
        };

        _context.WaterTanks.Add(tank);
        await _context.SaveChangesAsync(cancellationToken);
        return tank.Id;
    }
}
