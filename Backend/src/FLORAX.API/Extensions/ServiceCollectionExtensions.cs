using Microsoft.Extensions.DependencyInjection;

namespace FLORAX.API.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApiServices(this IServiceCollection services)
    {
        // Register API specific DI dependencies and configurations
        return services;
    }
}
