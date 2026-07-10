using FLORAX.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FLORAX.Infrastructure.Persistence.Configurations;

public class RoleConfiguration : IEntityTypeConfiguration<Role>
{
    public void Configure(EntityTypeBuilder<Role> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.RoleName).IsRequired().HasMaxLength(50);
        builder.Property(e => e.Description).HasMaxLength(250);
    }
}

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.FullName).IsRequired().HasMaxLength(100);
        builder.Property(e => e.Email).IsRequired().HasMaxLength(150);
        builder.Property(e => e.Phone).HasMaxLength(20);
        builder.Property(e => e.PasswordHash).IsRequired();
        builder.Property(e => e.Status).HasMaxLength(20);

        builder.HasOne(e => e.Role)
            .WithMany(r => r.Users)
            .HasForeignKey(e => e.RoleId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public class FarmConfiguration : IEntityTypeConfiguration<Farm>
{
    public void Configure(EntityTypeBuilder<Farm> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.FarmName).IsRequired().HasMaxLength(100);
        builder.Property(e => e.District).HasMaxLength(100);
        builder.Property(e => e.Province).HasMaxLength(100);
        builder.Property(e => e.Latitude).HasPrecision(18, 8);
        builder.Property(e => e.Longitude).HasPrecision(18, 8);
        builder.Property(e => e.TotalArea).HasPrecision(18, 2);

        builder.HasOne(e => e.Owner)
            .WithMany(u => u.Farms)
            .HasForeignKey(e => e.OwnerId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public class IrrigationZoneConfiguration : IEntityTypeConfiguration<IrrigationZone>
{
    public void Configure(EntityTypeBuilder<IrrigationZone> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.ZoneName).IsRequired().HasMaxLength(100);
        builder.Property(e => e.CropType).HasMaxLength(100);
        builder.Property(e => e.SoilType).HasMaxLength(100);
        builder.Property(e => e.Area).HasPrecision(18, 2);
        builder.Property(e => e.Status).HasMaxLength(20);

        builder.HasOne(e => e.Farm)
            .WithMany(f => f.IrrigationZones)
            .HasForeignKey(e => e.FarmId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class SensorDeviceConfiguration : IEntityTypeConfiguration<SensorDevice>
{
    public void Configure(EntityTypeBuilder<SensorDevice> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.DeviceSerial).IsRequired().HasMaxLength(100);
        builder.Property(e => e.SensorType).IsRequired().HasMaxLength(50);
        builder.Property(e => e.FirmwareVersion).HasMaxLength(50);
        builder.Property(e => e.Status).HasMaxLength(20);

        builder.HasOne(e => e.Zone)
            .WithMany(z => z.SensorDevices)
            .HasForeignKey(e => e.ZoneId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class ValveControllerConfiguration : IEntityTypeConfiguration<ValveController>
{
    public void Configure(EntityTypeBuilder<ValveController> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.DeviceSerial).IsRequired().HasMaxLength(100);
        builder.Property(e => e.State).HasMaxLength(20);
        builder.Property(e => e.FlowRate).HasPrecision(18, 2);

        builder.HasOne(e => e.Zone)
            .WithMany(z => z.ValveControllers)
            .HasForeignKey(e => e.ZoneId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class MotorConfiguration : IEntityTypeConfiguration<Motor>
{
    public void Configure(EntityTypeBuilder<Motor> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.MotorName).IsRequired().HasMaxLength(100);
        builder.Property(e => e.PowerRating).HasMaxLength(50);
        builder.Property(e => e.Status).HasMaxLength(20);
        builder.Property(e => e.RuntimeHours).HasPrecision(18, 2);

        builder.HasOne(e => e.Farm)
            .WithMany(f => f.Motors)
            .HasForeignKey(e => e.FarmId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class WaterTankConfiguration : IEntityTypeConfiguration<WaterTank>
{
    public void Configure(EntityTypeBuilder<WaterTank> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.TankName).IsRequired().HasMaxLength(100);
        builder.Property(e => e.CapacityLiters).HasPrecision(18, 2);
        builder.Property(e => e.CurrentLevel).HasPrecision(18, 2);
        builder.Property(e => e.Status).HasMaxLength(20);

        builder.HasOne(e => e.Farm)
            .WithMany(f => f.WaterTanks)
            .HasForeignKey(e => e.FarmId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class SoilMoistureReadingConfiguration : IEntityTypeConfiguration<SoilMoistureReading>
{
    public void Configure(EntityTypeBuilder<SoilMoistureReading> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.MoisturePercentage).HasPrecision(18, 2);

        builder.HasOne(e => e.Sensor)
            .WithMany(s => s.SoilMoistureReadings)
            .HasForeignKey(e => e.SensorId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.Zone)
            .WithMany(z => z.SoilMoistureReadings)
            .HasForeignKey(e => e.ZoneId)
            .OnDelete(DeleteBehavior.Restrict); // prevent multiple cascade paths
    }
}

public class TemperatureReadingConfiguration : IEntityTypeConfiguration<TemperatureReading>
{
    public void Configure(EntityTypeBuilder<TemperatureReading> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Temperature).HasPrecision(18, 2);

        builder.HasOne(e => e.Sensor)
            .WithMany(s => s.TemperatureReadings)
            .HasForeignKey(e => e.SensorId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class HumidityReadingConfiguration : IEntityTypeConfiguration<HumidityReading>
{
    public void Configure(EntityTypeBuilder<HumidityReading> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Humidity).HasPrecision(18, 2);

        builder.HasOne(e => e.Sensor)
            .WithMany(s => s.HumidityReadings)
            .HasForeignKey(e => e.SensorId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class WaterLevelReadingConfiguration : IEntityTypeConfiguration<WaterLevelReading>
{
    public void Configure(EntityTypeBuilder<WaterLevelReading> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.WaterLevel).HasPrecision(18, 2);

        builder.HasOne(e => e.Tank)
            .WithMany(t => t.WaterLevelReadings)
            .HasForeignKey(e => e.TankId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class IrrigationScheduleConfiguration : IEntityTypeConfiguration<IrrigationSchedule>
{
    public void Configure(EntityTypeBuilder<IrrigationSchedule> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.RepeatType).HasMaxLength(50);

        builder.HasOne(e => e.Zone)
            .WithMany(z => z.IrrigationSchedules)
            .HasForeignKey(e => e.ZoneId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.Creator)
            .WithMany(u => u.IrrigationSchedules)
            .HasForeignKey(e => e.CreatedBy)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public class IrrigationHistoryConfiguration : IEntityTypeConfiguration<IrrigationHistory>
{
    public void Configure(EntityTypeBuilder<IrrigationHistory> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.WaterUsed).HasPrecision(18, 2);
        builder.Property(e => e.Status).HasMaxLength(20);

        // Note: DbContext OnModelCreating explicitly configures delete behaviors for this entity to prevent cycles.
    }
}

public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Title).IsRequired().HasMaxLength(150);
        builder.Property(e => e.Message).IsRequired();
        builder.Property(e => e.Type).HasMaxLength(50);

        builder.HasOne(e => e.User)
            .WithMany(u => u.Notifications)
            .HasForeignKey(e => e.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class DeviceStatusConfiguration : IEntityTypeConfiguration<DeviceStatus>
{
    public void Configure(EntityTypeBuilder<DeviceStatus> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.DeviceType).HasMaxLength(50);
    }
}

public class WeatherDataConfiguration : IEntityTypeConfiguration<WeatherData>
{
    public void Configure(EntityTypeBuilder<WeatherData> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Temperature).HasPrecision(18, 2);
        builder.Property(e => e.Humidity).HasPrecision(18, 2);
        builder.Property(e => e.Rainfall).HasPrecision(18, 2);
        builder.Property(e => e.WindSpeed).HasPrecision(18, 2);
        builder.Property(e => e.WeatherCondition).HasMaxLength(100);

        builder.HasOne(e => e.Farm)
            .WithMany(f => f.WeatherData)
            .HasForeignKey(e => e.FarmId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class SolarBatteryStatusConfiguration : IEntityTypeConfiguration<SolarBatteryStatus>
{
    public void Configure(EntityTypeBuilder<SolarBatteryStatus> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.SolarVoltage).HasPrecision(18, 2);

        builder.HasOne(e => e.Farm)
            .WithMany(f => f.SolarBatteryStatuses)
            .HasForeignKey(e => e.FarmId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class WaterUsageReportConfiguration : IEntityTypeConfiguration<WaterUsageReport>
{
    public void Configure(EntityTypeBuilder<WaterUsageReport> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.TotalWaterUsed).HasPrecision(18, 2);
        builder.Property(e => e.AverageMoisture).HasPrecision(18, 2);

        builder.HasOne(e => e.Farm)
            .WithMany(f => f.WaterUsageReports)
            .HasForeignKey(e => e.FarmId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.Zone)
            .WithMany(z => z.WaterUsageReports)
            .HasForeignKey(e => e.ZoneId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public class MobileAppSettingsConfiguration : IEntityTypeConfiguration<MobileAppSettings>
{
    public void Configure(EntityTypeBuilder<MobileAppSettings> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Language).HasMaxLength(10);
        builder.Property(e => e.Theme).HasMaxLength(20);

        builder.HasOne(e => e.User)
            .WithMany(u => u.MobileAppSettings)
            .HasForeignKey(e => e.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
{
    public void Configure(EntityTypeBuilder<AuditLog> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Action).IsRequired().HasMaxLength(100);
        builder.Property(e => e.TableName).IsRequired().HasMaxLength(100);
        builder.Property(e => e.IpAddress).HasMaxLength(50);

        builder.HasOne(e => e.User)
            .WithMany(u => u.AuditLogs)
            .HasForeignKey(e => e.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
