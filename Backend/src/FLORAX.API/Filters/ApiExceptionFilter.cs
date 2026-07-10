using FLORAX.Shared.Exceptions;
using FLORAX.Shared.Responses;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace FLORAX.API.Filters;

public class ApiExceptionFilter : ExceptionFilterAttribute
{
    public override void OnException(ExceptionContext context)
    {
        if (context.Exception is ApiException apiException)
        {
            var response = ApiResponse<object>.Failure(apiException.Message);
            context.Result = new BadRequestObjectResult(response);
            context.ExceptionHandled = true;
        }
    }
}
