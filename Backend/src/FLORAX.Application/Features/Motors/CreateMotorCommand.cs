using System;
using System.Threading;
using System.Threading.Tasks;
using FLORAX.Application.Common.Interfaces;
using FLORAX.Domain.Entities;
using MediatR;

namespace FLORAX.Application.Features.Motors;

public record CreateMotorCommand : IRequest<Guid>
{
    public Guid FarmId { get; set; }
    public string MotorName { get; set; }
    public string PowerRating { get; set; }
}

public class CreateMotorCommandHandler : IRequestHandler<CreateMotorCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateMotorCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateMotorCommand request, CancellationToken cancellationToken)
    {
        var entity = new Motor
        {
            Id = Guid.NewGuid(),
            FarmId = request.FarmId,
            MotorName = request.MotorName,
            PowerRating = request.PowerRating,
            Status = "Stopped",
            RuntimeHours = 0,
            CreatedBy = "System",
            Created = DateTime.UtcNow,
            LastModifiedBy = "System",
            LastModified = DateTime.UtcNow
        };

        _context.Motors.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);
        return entity.Id;
    }
}
