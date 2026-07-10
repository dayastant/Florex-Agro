using System.Threading;
using System.Threading.Tasks;
using FLORAX.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FLORAX.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Role> Roles { get; }
    DbSet<User> Users { get; }
    DbSet<Farm> Farms { get; }
    DbSet<IrrigationZone> IrrigationZones { get; }
    DbSet<SensorDevice> SensorDevices { get; }
    DbSet<ValveController> ValveControllers { get; }
    DbSet<Motor> Motors { get; }
    DbSet<WaterTank> WaterTanks { get; }
    DbSet<SoilMoistureReading> SoilMoistureReadings { get; }
    DbSet<TemperatureReading> TemperatureReadings { get; }
    DbSet<HumidityReading> HumidityReadings { get; }
    DbSet<WaterLevelReading> WaterLevelReadings { get; }
    DbSet<IrrigationSchedule> IrrigationSchedules { get; }
    DbSet<IrrigationHistory> IrrigationHistories { get; }
    DbSet<Notification> Notifications { get; }
    DbSet<DeviceStatus> DeviceStatuses { get; }
    DbSet<WeatherData> WeatherDatas { get; }
    DbSet<SolarBatteryStatus> SolarBatteryStatuses { get; }
    DbSet<WaterUsageReport> WaterUsageReports { get; }
    DbSet<MobileAppSettings> MobileAppSettings { get; }
    DbSet<AuditLog> AuditLogs { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
