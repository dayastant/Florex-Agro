using FLORAX.API.Middleware;
using Microsoft.AspNetCore.Builder;

namespace FLORAX.API.Extensions;

public static class MiddlewareExtensions
{
    public static IApplicationBuilder UseCustomMiddlewares(this IApplicationBuilder app)
    {
        app.UseMiddleware<RequestLoggingMiddleware>();
        app.UseMiddleware<JwtMiddleware>();
        app.UseMiddleware<ExceptionMiddleware>();
        return app;
    }
}
