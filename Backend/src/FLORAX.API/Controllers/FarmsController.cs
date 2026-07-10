using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FLORAX.Application.DTOs;
using FLORAX.Application.Features.Farms;
using FLORAX.Shared.Responses;
using Microsoft.AspNetCore.Mvc;

namespace FLORAX.API.Controllers;

public class FarmsController : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<FarmDto>>>> Get([FromQuery] Guid? ownerId)
    {
        var farms = await Mediator.Send(new GetFarmsQuery { OwnerId = ownerId });
        return Ok(ApiResponse<List<FarmDto>>.Success(farms, "Farms retrieved successfully."));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<Guid>>> Create(CreateFarmCommand command)
    {
        var id = await Mediator.Send(command);
        return Ok(ApiResponse<Guid>.Success(id, "Farm created successfully."));
    }

    [HttpPut("{id}/allocate")]
    public async Task<ActionResult<ApiResponse<bool>>> Allocate(Guid id, [FromBody] AllocateFarmRequest request)
    {
        var result = await Mediator.Send(new AllocateFarmCommand { FarmId = id, OwnerId = request.OwnerId });
        if (!result)
            return NotFound(ApiResponse<bool>.Failure("Farm not found."));
            
        return Ok(ApiResponse<bool>.Success(true, "Farm allocated successfully."));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<bool>>> Update(Guid id, [FromBody] UpdateFarmCommand command)
    {
        if (id != command.Id)
            return BadRequest(ApiResponse<bool>.Failure("ID mismatch."));

        var result = await Mediator.Send(command);
        if (!result)
            return NotFound(ApiResponse<bool>.Failure("Farm not found."));

        return Ok(ApiResponse<bool>.Success(true, "Farm updated successfully."));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(Guid id)
    {
        var result = await Mediator.Send(new DeleteFarmCommand { Id = id });
        if (!result)
            return NotFound(ApiResponse<bool>.Failure("Farm not found."));

        return Ok(ApiResponse<bool>.Success(true, "Farm deleted successfully."));
    }
}

public class AllocateFarmRequest
{
    public Guid OwnerId { get; set; }
}
