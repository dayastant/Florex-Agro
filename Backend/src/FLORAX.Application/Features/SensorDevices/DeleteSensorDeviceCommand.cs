using System;
using System.Threading;
using System.Threading.Tasks;
using FLORAX.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FLORAX.Application.Features.SensorDevices;

public record DeleteSensorDeviceCommand : IRequest<bool>
{
    public Guid Id { get; set; }
}

public class DeleteSensorDeviceCommandHandler : IRequestHandler<DeleteSensorDeviceCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public DeleteSensorDeviceCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(DeleteSensorDeviceCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.SensorDevices.FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken);
        if (entity == null)
            return false;

        _context.SensorDevices.Remove(entity);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
