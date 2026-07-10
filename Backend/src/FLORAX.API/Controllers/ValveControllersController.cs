using System.Collections.Generic;
using System.Threading.Tasks;
using FLORAX.Application.DTOs;
using FLORAX.Application.Features.ValveControllers;
using FLORAX.Shared.Responses;
using Microsoft.AspNetCore.Mvc;

namespace FLORAX.API.Controllers;

public class ValveControllersController : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<ValveControllerDto>>>> Get()
    {
        var controllers = await Mediator.Send(new GetValveControllersQuery());
        return Ok(ApiResponse<List<ValveControllerDto>>.Success(controllers, "Valves retrieved successfully."));
    }

    [HttpPatch("{id}")]
    public async Task<ActionResult<ApiResponse<bool>>> Update(Guid id, [FromBody] UpdateValveControllerCommand command)
    {
        command.Id = id;
        var result = await Mediator.Send(command);
        if (!result)
            return NotFound(ApiResponse<bool>.Failure("Valve controller not found."));

        return Ok(ApiResponse<bool>.Success(true, "Valve controller status updated successfully."));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<Guid>>> Create([FromBody] CreateValveControllerCommand command)
    {
        var id = await Mediator.Send(command);
        return Ok(ApiResponse<Guid>.Success(id, "Valve created successfully."));
    }
}
