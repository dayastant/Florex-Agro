using System;
using System.Threading;
using System.Threading.Tasks;
using FLORAX.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FLORAX.Application.Features.SensorDevices;

public record AllocateSensorDeviceCommand : IRequest<bool>
{
    public Guid SensorDeviceId { get; set; }
    public Guid ZoneId { get; set; }
}

public class AllocateSensorDeviceCommandHandler : IRequestHandler<AllocateSensorDeviceCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public AllocateSensorDeviceCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(AllocateSensorDeviceCommand request, CancellationToken cancellationToken)
    {
        var device = await _context.SensorDevices.FirstOrDefaultAsync(s => s.Id == request.SensorDeviceId, cancellationToken);
        if (device == null)
            return false;

        device.ZoneId = request.ZoneId;
        device.LastModifiedBy = "System";
        device.LastModified = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
