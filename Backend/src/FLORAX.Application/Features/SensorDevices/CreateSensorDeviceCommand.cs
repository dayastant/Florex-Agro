using System;
using System.Threading;
using System.Threading.Tasks;
using FLORAX.Application.Common.Interfaces;
using FLORAX.Domain.Entities;
using MediatR;

namespace FLORAX.Application.Features.SensorDevices;

public record CreateSensorDeviceCommand : IRequest<Guid>
{
    public Guid ZoneId { get; set; }
    public string DeviceSerial { get; set; } = null!;
    public string SensorType { get; set; } = null!;
    public string FirmwareVersion { get; set; } = null!;
    public string Status { get; set; } = null!;
    public int BatteryPercentage { get; set; }
    public int SignalStrength { get; set; }
}

public class CreateSensorDeviceCommandHandler : IRequestHandler<CreateSensorDeviceCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateSensorDeviceCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateSensorDeviceCommand request, CancellationToken cancellationToken)
    {
        var entity = new SensorDevice
        {
            ZoneId = request.ZoneId,
            DeviceSerial = request.DeviceSerial,
            SensorType = request.SensorType,
            FirmwareVersion = request.FirmwareVersion,
            Status = request.Status,
            BatteryPercentage = request.BatteryPercentage,
            SignalStrength = request.SignalStrength,
            CreatedBy = "System",
            LastModifiedBy = "System"
        };

        _context.SensorDevices.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
