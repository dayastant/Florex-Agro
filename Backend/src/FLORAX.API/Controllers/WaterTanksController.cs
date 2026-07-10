using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FLORAX.Application.DTOs;
using FLORAX.Application.Features.WaterTanks;
using FLORAX.Shared.Responses;
using Microsoft.AspNetCore.Mvc;

namespace FLORAX.API.Controllers;

public class WaterTanksController : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<WaterTankDto>>>> Get()
    {
        var tanks = await Mediator.Send(new GetWaterTanksQuery());
        return Ok(ApiResponse<List<WaterTankDto>>.Success(tanks, "Tanks retrieved successfully."));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<Guid>>> Create([FromBody] CreateWaterTankCommand command)
    {
        var id = await Mediator.Send(command);
        return Ok(ApiResponse<Guid>.Success(id, "Tank created successfully."));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<bool>>> Update(Guid id, [FromBody] UpdateWaterTankCommand command)
    {
        if (id != command.Id)
            return BadRequest(ApiResponse<bool>.Failure("ID mismatch."));

        var result = await Mediator.Send(command);
        if (!result)
            return NotFound(ApiResponse<bool>.Failure("Tank not found."));

        return Ok(ApiResponse<bool>.Success(true, "Tank updated successfully."));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(Guid id)
    {
        var result = await Mediator.Send(new DeleteWaterTankCommand { Id = id });
        if (!result)
            return NotFound(ApiResponse<bool>.Failure("Tank not found."));

        return Ok(ApiResponse<bool>.Success(true, "Tank deleted successfully."));
    }
}
