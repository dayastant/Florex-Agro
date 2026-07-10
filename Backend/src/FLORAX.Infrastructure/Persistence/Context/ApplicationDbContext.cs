using System.Reflection;
using System.Threading;
using System.Threading.Tasks;
using FLORAX.Application.Common.Interfaces;
using FLORAX.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FLORAX.Infrastructure.Persistence.Context;

public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Role> Roles => Set<Role>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Farm> Farms => Set<Farm>();
    public DbSet<IrrigationZone> IrrigationZones => Set<IrrigationZone>();
    public DbSet<SensorDevice> SensorDevices => Set<SensorDevice>();
    public DbSet<ValveController> ValveControllers => Set<ValveController>();
    public DbSet<Motor> Motors => Set<Motor>();
    public DbSet<WaterTank> WaterTanks => Set<WaterTank>();
    public DbSet<SoilMoistureReading> SoilMoistureReadings => Set<SoilMoistureReading>();
    public DbSet<TemperatureReading> TemperatureReadings => Set<TemperatureReading>();
    public DbSet<HumidityReading> HumidityReadings => Set<HumidityReading>();
    public DbSet<WaterLevelReading> WaterLevelReadings => Set<WaterLevelReading>();
    public DbSet<IrrigationSchedule> IrrigationSchedules => Set<IrrigationSchedule>();
    public DbSet<IrrigationHistory> IrrigationHistories => Set<IrrigationHistory>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<DeviceStatus> DeviceStatuses => Set<DeviceStatus>();
    public DbSet<WeatherData> WeatherDatas => Set<WeatherData>();
    public DbSet<SolarBatteryStatus> SolarBatteryStatuses => Set<SolarBatteryStatus>();
    public DbSet<WaterUsageReport> WaterUsageReports => Set<WaterUsageReport>();
    public DbSet<MobileAppSettings> MobileAppSettings => Set<MobileAppSettings>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        base.OnModelCreating(modelBuilder);
        
        // Define relations explicitly to avoid circular dependency cycles during migrations
        modelBuilder.Entity<IrrigationHistory>()
            .HasOne(h => h.Schedule)
            .WithMany(s => s.IrrigationHistories)
            .HasForeignKey(h => h.ScheduleId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<IrrigationHistory>()
            .HasOne(h => h.Zone)
            .WithMany(z => z.IrrigationHistories)
            .HasForeignKey(h => h.ZoneId)
            .OnDelete(DeleteBehavior.Restrict);
            
        modelBuilder.Entity<IrrigationHistory>()
            .HasOne(h => h.Valve)
            .WithMany(v => v.IrrigationHistories)
            .HasForeignKey(h => h.ValveId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<IrrigationHistory>()
            .HasOne(h => h.Motor)
            .WithMany(m => m.IrrigationHistories)
            .HasForeignKey(h => h.MotorId)
            .OnDelete(DeleteBehavior.Restrict);
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await base.SaveChangesAsync(cancellationToken);
    }
}
