using System;
using System.Threading;
using System.Threading.Tasks;
using FLORAX.Application.Common.Interfaces;
using FLORAX.Domain.Entities;
using MediatR;

namespace FLORAX.Application.Features.ValveControllers;

public record CreateValveControllerCommand : IRequest<Guid>
{
    public Guid ZoneId { get; set; }
    public string DeviceSerial { get; set; }
}

public class CreateValveControllerCommandHandler : IRequestHandler<CreateValveControllerCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateValveControllerCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateValveControllerCommand request, CancellationToken cancellationToken)
    {
        var entity = new ValveController
        {
            Id = Guid.NewGuid(),
            ZoneId = request.ZoneId,
            DeviceSerial = request.DeviceSerial,
            State = "Closed",
            FlowRate = 0,
            CreatedBy = "System",
            Created = DateTime.UtcNow,
            LastModifiedBy = "System",
            LastModified = DateTime.UtcNow
        };

        _context.ValveControllers.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);
        return entity.Id;
    }
}
