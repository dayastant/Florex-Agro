using System;
using System.Threading;
using System.Threading.Tasks;
using FLORAX.Application.Common.Interfaces;
using FLORAX.Application.Features.Dashboard;
using FLORAX.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace FLORAX.Application.Tests.Dashboard;

public class GetDashboardSummaryQueryTests
{
    [Fact]
    public async Task Handle_ReturnsAggregatedDashboardSummary()
    {
        await using var context = new TestApplicationDbContext();
        var farmA = new Farm { Id = Guid.NewGuid(), FarmName = "Farm A", District = "District A", Province = "Province A" };
        var farmB = new Farm { Id = Guid.NewGuid(), FarmName = "Farm B", District = "District B", Province = "Province B" };

        context.Farms.AddRange(farmA, farmB);

        var zoneA = new IrrigationZone { Id = Guid.NewGuid(), FarmId = farmA.Id, ZoneName = "Zone 1", CropType = "Tomato", SoilType = "Clay", Status = "Active" };
        var zoneB = new IrrigationZone { Id = Guid.NewGuid(), FarmId = farmB.Id, ZoneName = "Zone 2", CropType = "Cucumber", SoilType = "Loam", Status = "Active" };
        context.IrrigationZones.AddRange(zoneA, zoneB);

        context.SensorDevices.AddRange(
            new SensorDevice { Id = Guid.NewGuid(), ZoneId = zoneA.Id, DeviceSerial = "S1", SensorType = "Soil", FirmwareVersion = "1.0", Status = "Active" },
            new SensorDevice { Id = Guid.NewGuid(), ZoneId = zoneB.Id, DeviceSerial = "S2", SensorType = "Soil", FirmwareVersion = "1.0", Status = "Offline" });

        context.SoilMoistureReadings.AddRange(
            new SoilMoistureReading { Id = Guid.NewGuid(), ZoneId = zoneA.Id, MoisturePercentage = 70m },
            new SoilMoistureReading { Id = Guid.NewGuid(), ZoneId = zoneB.Id, MoisturePercentage = 50m });

        await context.SaveChangesAsync();

        var handler = new GetDashboardSummaryQueryHandler(context);

        var result = await handler.Handle(new GetDashboardSummaryQuery(), CancellationToken.None);

        Assert.Equal(2, result.TotalFarms);
        Assert.Equal(2, result.TotalZones);
        Assert.Equal(1, result.ActiveSensors);
        Assert.Equal(60m, result.AverageMoisture);
        Assert.Equal("Healthy", result.SystemStatus);
    }

    private sealed class TestApplicationDbContext : DbContext, IApplicationDbContext
    {
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

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseInMemoryDatabase(Guid.NewGuid().ToString());
        }
    }
}
