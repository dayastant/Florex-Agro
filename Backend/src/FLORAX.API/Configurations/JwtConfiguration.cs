using Microsoft.Extensions.DependencyInjection;

namespace FLORAX.API.Configurations;

public static class JwtConfiguration
{
    public static IServiceCollection AddJwtAuthentication(this IServiceCollection services)
    {
        // Setup authentication scheme configuration bindings
        return services;
    }
}
