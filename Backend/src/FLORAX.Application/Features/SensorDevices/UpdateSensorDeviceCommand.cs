using System;
using System.Threading;
using System.Threading.Tasks;
using FLORAX.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FLORAX.Application.Features.SensorDevices;

public record UpdateSensorDeviceCommand : IRequest<bool>
{
    public Guid Id { get; set; }
    public string DeviceSerial { get; set; } = null!;
    public string SensorType { get; set; } = null!;
    public string FirmwareVersion { get; set; } = null!;
    public string Status { get; set; } = null!;
    public int BatteryPercentage { get; set; }
    public int SignalStrength { get; set; }
}

public class UpdateSensorDeviceCommandHandler : IRequestHandler<UpdateSensorDeviceCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public UpdateSensorDeviceCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(UpdateSensorDeviceCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.SensorDevices.FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken);
        if (entity == null)
            return false;

        entity.DeviceSerial = request.DeviceSerial;
        entity.SensorType = request.SensorType;
        entity.FirmwareVersion = request.FirmwareVersion;
        entity.Status = request.Status;
        entity.BatteryPercentage = request.BatteryPercentage;
        entity.SignalStrength = request.SignalStrength;
        
        entity.LastModifiedBy = "System";
        entity.LastModified = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
