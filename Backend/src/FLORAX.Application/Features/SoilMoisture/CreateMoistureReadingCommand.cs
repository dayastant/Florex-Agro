using System;
using System.Threading;
using System.Threading.Tasks;
using FLORAX.Application.Common.Interfaces;
using FLORAX.Domain.Entities;
using MediatR;

namespace FLORAX.Application.Features.SoilMoisture;

public record CreateMoistureReadingCommand : IRequest<Guid>
{
    public Guid SensorId { get; set; }
    public Guid ZoneId { get; set; }
    public decimal MoisturePercentage { get; set; }
}

public class CreateMoistureReadingCommandHandler : IRequestHandler<CreateMoistureReadingCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateMoistureReadingCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateMoistureReadingCommand request, CancellationToken cancellationToken)
    {
        var entity = new SoilMoistureReading
        {
            SensorId = request.SensorId,
            ZoneId = request.ZoneId,
            MoisturePercentage = request.MoisturePercentage,
            RecordedAt = DateTime.UtcNow,
            CreatedBy = "System",
            LastModifiedBy = "System"
        };

        _context.SoilMoistureReadings.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
