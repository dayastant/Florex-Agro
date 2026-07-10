using System;
using System.Threading.Tasks;
using FLORAX.Application.DTOs;
using FLORAX.Application.Features.Authentication;
using FLORAX.Shared.Responses;
using Microsoft.AspNetCore.Mvc;

namespace FLORAX.API.Controllers;

public class AuthController : ApiControllerBase
{
    [HttpPost("register")]
    public async Task<ActionResult<ApiResponse<Guid>>> Register(RegisterCommand command)
    {
        var id = await Mediator.Send(command);
        return Ok(ApiResponse<Guid>.Success(id, "Registration successful."));
    }

    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<LoginResultDto>>> Login(LoginQuery query)
    {
        var result = await Mediator.Send(query);
        return Ok(ApiResponse<LoginResultDto>.Success(result, "Login successful."));
    }
}
