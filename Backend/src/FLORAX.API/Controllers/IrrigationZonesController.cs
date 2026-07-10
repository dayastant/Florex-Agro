using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FLORAX.Application.DTOs;
using FLORAX.Application.Features.IrrigationZones;
using FLORAX.Shared.Responses;
using Microsoft.AspNetCore.Mvc;

namespace FLORAX.API.Controllers;

public class IrrigationZonesController : ApiControllerBase
{
    [HttpGet("farm/{farmId}")]
    public async Task<ActionResult<ApiResponse<List<IrrigationZoneDto>>>> GetByFarm(Guid farmId)
    {
        var zones = await Mediator.Send(new GetZonesQuery(farmId));
        return Ok(ApiResponse<List<IrrigationZoneDto>>.Success(zones, "Zones retrieved successfully."));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<Guid>>> Create(CreateZoneCommand command)
    {
        var id = await Mediator.Send(command);
        return Ok(ApiResponse<Guid>.Success(id, "Zone created successfully."));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<IrrigationZoneDto>>> Get(Guid id)
    {
        var zone = await Mediator.Send(new GetZoneByIdQuery(id));
        if (zone == null)
            return NotFound(ApiResponse<IrrigationZoneDto>.Failure("Zone not found."));

        return Ok(ApiResponse<IrrigationZoneDto>.Success(zone, "Zone retrieved successfully."));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<bool>>> Update(Guid id, [FromBody] UpdateZoneCommand command)
    {
        command.Id = id;
        var result = await Mediator.Send(command);
        if (!result)
            return NotFound(ApiResponse<bool>.Failure("Zone not found."));

        return Ok(ApiResponse<bool>.Success(true, "Zone updated successfully."));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(Guid id)
    {
        var result = await Mediator.Send(new DeleteZoneCommand { Id = id });
        if (!result)
            return NotFound(ApiResponse<bool>.Failure("Zone not found."));

        return Ok(ApiResponse<bool>.Success(true, "Zone deleted successfully."));
    }

    [HttpPut("{id}/status")]
    public async Task<ActionResult<ApiResponse<bool>>> UpdateStatus(Guid id, [FromBody] UpdateZoneStatusRequest request)
    {
        var result = await Mediator.Send(new UpdateZoneStatusCommand { Id = id, Status = request.Status });
        if (!result)
            return NotFound(ApiResponse<bool>.Failure("Zone not found."));

        return Ok(ApiResponse<bool>.Success(true, "Zone status updated successfully."));
    }
}

public class UpdateZoneStatusRequest
{
    public string Status { get; set; } = null!;
}
