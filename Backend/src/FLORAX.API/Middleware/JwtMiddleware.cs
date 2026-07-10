using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace FLORAX.API.Middleware;

public class JwtMiddleware
{
    private readonly RequestDelegate _next;

    public JwtMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Token claims parsing and context assignment
        await _next(context);
    }
}
