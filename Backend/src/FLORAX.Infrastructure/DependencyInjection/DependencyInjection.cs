using System;
using FLORAX.Application.Common.Interfaces;
using FLORAX.Infrastructure.Cloud;
using FLORAX.Infrastructure.Email;
using FLORAX.Infrastructure.Identity;
using FLORAX.Infrastructure.IoT;
using FLORAX.Infrastructure.JWT;
using FLORAX.Infrastructure.MQTT;
using FLORAX.Infrastructure.Persistence.Context;
using FLORAX.Infrastructure.Repositories;
using FLORAX.Infrastructure.Services;
using FLORAX.Infrastructure.SMS;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace FLORAX.Infrastructure.DependencyInjection;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseMySql(
                connectionString, 
                new MySqlServerVersion(new Version(8, 0, 30)),
                b => b.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName)));

        services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<ApplicationDbContext>());
        
        // Register HttpContextAccessor
        services.AddHttpContextAccessor();

        // Register repositories & UnitOfWork
        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // Register Core Services
        services.AddTransient<IDateTimeService, DateTimeService>();
        services.AddTransient<IEmailService, EmailService>();
        services.AddTransient<ISmsService, SmsService>();

        // Register Cache
        services.AddMemoryCache();
        services.AddScoped<ICacheService, MemoryCacheService>();

        // Register JWT configurations & Generator
        services.Configure<JwtSettings>(configuration.GetSection(JwtSettings.SectionName));
        services.AddSingleton<ITokenService, JwtTokenGenerator>();

        // Register Identity Service
        services.AddScoped<IdentityService>();

        // Register IoT & MQTT & Cloud services
        services.AddScoped<IotDeviceService>();
        services.AddScoped<MqttClientService>();
        services.AddScoped<CloudStorageService>();

        return services;
    }
}
