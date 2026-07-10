using Microsoft.Extensions.DependencyInjection;

namespace FLORAX.API.Configurations;

public static class SwaggerConfiguration
{
    public static IServiceCollection ConfigureSwaggerOptions(this IServiceCollection services)
    {
        // Custom swagger options settings
        return services;
    }
}
