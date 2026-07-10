using System;
using System.Linq;
using System.Threading.Tasks;
using FLORAX.Domain.Constants;
using FLORAX.Domain.Entities;
using FLORAX.Infrastructure.Persistence.Context;

namespace FLORAX.Infrastructure.Persistence.Seed;

public static class ApplicationDbContextSeed
{
    public static async Task SeedDatabaseAsync(ApplicationDbContext context)
    {
        // 1. Seed Roles
        var rolesToSeed = new[]
        {
            new Role
            {
                Id = RolesConstants.SuperAdminId,
                RoleName = RolesConstants.SuperAdmin,
                Description = "Super Administrator role with absolute full system access",
                CreatedBy = "System",
                LastModifiedBy = "System"
            },
            new Role
            {
                Id = RolesConstants.AdministratorId,
                RoleName = RolesConstants.Administrator,
                Description = "Administrator role with full control",
                CreatedBy = "System",
                LastModifiedBy = "System"
            },
            new Role
            {
                Id = RolesConstants.FarmerId,
                RoleName = RolesConstants.Farmer,
                Description = "Farmer role to manage farms and zones",
                CreatedBy = "System",
                LastModifiedBy = "System"
            },
            new Role
            {
                Id = RolesConstants.TechnicianId,
                RoleName = RolesConstants.Technician,
                Description = "Technician role to service sensor devices",
                CreatedBy = "System",
                LastModifiedBy = "System"
            }
        };

        foreach (var role in rolesToSeed)
        {
            var existing = context.Roles.FirstOrDefault(r => r.Id == role.Id);
            if (existing == null)
            {
                context.Roles.Add(role);
            }
        }
        await context.SaveChangesAsync();

        // 2. Seed Default Users
        var usersToSeed = new[]
        {
            new User
            {
                Id = Guid.Parse("44444444-4444-4444-4444-444444444444"),
                RoleId = RolesConstants.SuperAdminId,
                FullName = "FLORAX Super Admin",
                Email = "superadmin@florax.com",
                Phone = "+905554443333",
                PasswordHash = FLORAX.Shared.Utilities.EncryptionUtility.HashSha256("superadmin123"),
                Status = "Active",
                CreatedBy = "System",
                LastModifiedBy = "System"
            },
            new User
            {
                Id = Guid.Parse("99999999-9999-9999-9999-999999999999"),
                RoleId = RolesConstants.AdministratorId,
                FullName = "FLORAX Admin",
                Email = "admin@florax.com",
                Phone = "+905554443322",
                PasswordHash = FLORAX.Shared.Utilities.EncryptionUtility.HashSha256("admin123"),
                Status = "Active",
                CreatedBy = "System",
                LastModifiedBy = "System"
            },
            new User
            {
                Id = Guid.Parse("88888888-8888-8888-8888-888888888888"),
                RoleId = RolesConstants.TechnicianId,
                FullName = "FLORAX Tech",
                Email = "technician@florax.com",
                Phone = "+905554443311",
                PasswordHash = FLORAX.Shared.Utilities.EncryptionUtility.HashSha256("tech123"),
                Status = "Active",
                CreatedBy = "System",
                LastModifiedBy = "System"
            },
            new User
            {
                Id = Guid.Parse("77777777-7777-7777-7777-777777777777"),
                RoleId = RolesConstants.FarmerId,
                FullName = "FLORAX Farmer",
                Email = "farmer@florax.com",
                Phone = "+905554443300",
                PasswordHash = FLORAX.Shared.Utilities.EncryptionUtility.HashSha256("farmer123"),
                Status = "Active",
                CreatedBy = "System",
                LastModifiedBy = "System"
            }
        };

        foreach (var user in usersToSeed)
        {
            var existing = context.Users.FirstOrDefault(u => u.Email == user.Email);
            if (existing == null)
            {
                context.Users.Add(user);
            }
            else
            {
                existing.PasswordHash = user.PasswordHash;
                existing.RoleId = user.RoleId;
            }
        }
        await context.SaveChangesAsync();

        // 3. Seed Default Farm
        var farmId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        var existingFarm = context.Farms.FirstOrDefault(f => f.Id == farmId);
        if (existingFarm != null)
        {
            existingFarm.OwnerId = Guid.Parse("77777777-7777-7777-7777-777777777777");
            await context.SaveChangesAsync();
        }
        else
        {
            var defaultFarm = new Farm
            {
                Id = farmId,
                FarmName = "Florax Primary Farm",
                District = "Kadikoy",
                Province = "Istanbul",
                TotalArea = 25.5m,
                OwnerId = Guid.Parse("77777777-7777-7777-7777-777777777777"),
                Latitude = 39.92m,
                Longitude = 32.85m,
                CreatedBy = "System",
                LastModifiedBy = "System"
            };
            context.Farms.Add(defaultFarm);
            await context.SaveChangesAsync();
        }

        // 4. Seed Default Zones
        if (!context.IrrigationZones.Any())
        {
            var zone1 = new IrrigationZone
            {
                Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                FarmId = farmId,
                ZoneName = "North Orchard",
                CropType = "Apples",
                SoilType = "Clay Loam",
                Area = 10.0m,
                Status = "Active",
                CreatedBy = "System",
                LastModifiedBy = "System"
            };
            var zone2 = new IrrigationZone
            {
                Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
                FarmId = farmId,
                ZoneName = "Vineyards Strip B",
                CropType = "Grapes",
                SoilType = "Sandy Loam",
                Area = 15.5m,
                Status = "Active",
                CreatedBy = "System",
                LastModifiedBy = "System"
            };
            context.IrrigationZones.AddRange(zone1, zone2);
            await context.SaveChangesAsync();
        }

        // 5. Seed Default Motors
        if (!context.Motors.Any())
        {
            var motor1 = new Motor
            {
                Id = Guid.Parse("44444444-4444-4444-4444-444444444444"),
                FarmId = farmId,
                MotorName = "Main Irrigation Pump A",
                PowerRating = "15 HP",
                Status = "Running",
                RuntimeHours = 142.5m,
                CreatedBy = "System",
                LastModifiedBy = "System"
            };
            var motor2 = new Motor
            {
                Id = Guid.Parse("55555555-5555-5555-5555-555555555555"),
                FarmId = farmId,
                MotorName = "West Booster Pump B",
                PowerRating = "7.5 HP",
                Status = "Idle",
                RuntimeHours = 18.0m,
                CreatedBy = "System",
                LastModifiedBy = "System"
            };
            context.Motors.AddRange(motor1, motor2);
            await context.SaveChangesAsync();
        }

        // 6. Seed Default WaterTanks
        if (!context.WaterTanks.Any())
        {
            var tank1 = new WaterTank
            {
                Id = Guid.Parse("66666666-6666-6666-6666-666666666666"),
                FarmId = farmId,
                TankName = "Primary Reservoir East",
                CapacityLiters = 20000m,
                CurrentLevel = 14200m,
                Status = "Normal",
                CreatedBy = "System",
                LastModifiedBy = "System"
            };
            var tank2 = new WaterTank
            {
                Id = Guid.Parse("77777777-7777-7777-7777-777777777777"),
                FarmId = farmId,
                TankName = "Buffer Storage West",
                CapacityLiters = 5000m,
                CurrentLevel = 1100m,
                Status = "Low Level",
                CreatedBy = "System",
                LastModifiedBy = "System"
            };
            context.WaterTanks.AddRange(tank1, tank2);
            await context.SaveChangesAsync();
        }

        // 7. Seed Default Sensor Devices
        if (!context.SensorDevices.Any())
        {
            var dev1 = new SensorDevice
            {
                Id = Guid.Parse("88888888-8888-8888-8888-888888888888"),
                ZoneId = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                DeviceSerial = "FX-SOIL-N1",
                SensorType = "Moisture/Temp",
                FirmwareVersion = "v2.1.4",
                BatteryPercentage = 88,
                SignalStrength = 92,
                Status = "Online",
                InstalledAt = DateTime.UtcNow.AddDays(-60),
                CreatedBy = "System",
                LastModifiedBy = "System"
            };
            var dev2 = new SensorDevice
            {
                Id = Guid.Parse("a8888888-8888-8888-8888-888888888888"),
                ZoneId = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                DeviceSerial = "FX-TEMP-A1",
                SensorType = "Temp/Humidity",
                FirmwareVersion = "v2.1.4",
                BatteryPercentage = 42,
                SignalStrength = 55,
                Status = "Online",
                InstalledAt = DateTime.UtcNow.AddDays(-45),
                CreatedBy = "System",
                LastModifiedBy = "System"
            };
            var dev3 = new SensorDevice
            {
                Id = Guid.Parse("b8888888-8888-8888-8888-888888888888"),
                ZoneId = Guid.Parse("33333333-3333-3333-3333-333333333333"),
                DeviceSerial = "FX-FLOW-V1",
                SensorType = "Flow Controller",
                FirmwareVersion = "v1.8.2",
                BatteryPercentage = 95,
                SignalStrength = 85,
                Status = "Online",
                InstalledAt = DateTime.UtcNow.AddDays(-30),
                CreatedBy = "System",
                LastModifiedBy = "System"
            };
            var dev4 = new SensorDevice
            {
                Id = Guid.Parse("c8888888-8888-8888-8888-888888888888"),
                ZoneId = Guid.Parse("33333333-3333-3333-3333-333333333333"),
                DeviceSerial = "FX-AUX-D2",
                SensorType = "Moisture/Temp",
                FirmwareVersion = "v2.1.2",
                BatteryPercentage = 12,
                SignalStrength = 15,
                Status = "Offline",
                InstalledAt = DateTime.UtcNow.AddDays(-10),
                CreatedBy = "System",
                LastModifiedBy = "System"
            };
            context.SensorDevices.AddRange(dev1, dev2, dev3, dev4);
            await context.SaveChangesAsync();
        }

        if (!context.Notifications.Any())
        {
            var techUserId = Guid.Parse("88888888-8888-8888-8888-888888888888");
            var alert1 = new Notification
            {
                Id = Guid.NewGuid(),
                UserId = techUserId,
                Title = "Critical Sensor Offline",
                Message = "Sensor FX-AUX-D2 (North Orchard) is reporting OFFLINE state. Immediate physical check recommended.",
                Type = "Error",
                IsRead = false,
                CreatedBy = "System",
                LastModifiedBy = "System"
            };
            var alert2 = new Notification
            {
                Id = Guid.NewGuid(),
                UserId = techUserId,
                Title = "Low Battery Warning",
                Message = "Sensor FX-TEMP-A2 battery is currently at 12%. Schedule battery replacement.",
                Type = "Warning",
                IsRead = false,
                CreatedBy = "System",
                LastModifiedBy = "System"
            };
            var alert3 = new Notification
            {
                Id = Guid.NewGuid(),
                UserId = techUserId,
                Title = "Water Pressure Drop",
                Message = "Reservoir Main Tank A outlet reports a 15% pressure drop. Inspect pipe seals.",
                Type = "Info",
                IsRead = false,
                CreatedBy = "System",
                LastModifiedBy = "System"
            };
            context.Notifications.AddRange(alert1, alert2, alert3);
            await context.SaveChangesAsync();
        }
    }
}
