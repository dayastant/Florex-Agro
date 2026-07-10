using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FLORAX.Application.DTOs;
using FLORAX.Application.Features.Motors;
using FLORAX.Shared.Responses;
using Microsoft.AspNetCore.Mvc;

namespace FLORAX.API.Controllers;

public class MotorsController : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<MotorDto>>>> Get()
    {
        var motors = await Mediator.Send(new GetMotorsQuery());
        return Ok(ApiResponse<List<MotorDto>>.Success(motors, "Motors retrieved successfully."));
    }

    [HttpPatch("{id}")]
    public async Task<ActionResult<ApiResponse<bool>>> Update(Guid id, [FromBody] UpdateMotorCommand command)
    {
        command.Id = id;
        var result = await Mediator.Send(command);
        if (!result)
            return NotFound(ApiResponse<bool>.Failure("Motor not found."));

        return Ok(ApiResponse<bool>.Success(true, "Motor status updated successfully."));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<Guid>>> Create([FromBody] CreateMotorCommand command)
    {
        var id = await Mediator.Send(command);
        return Ok(ApiResponse<Guid>.Success(id, "Motor created successfully."));
    }
}
