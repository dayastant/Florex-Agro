using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FLORAX.Application.DTOs;
using FLORAX.Application.Features.SoilMoisture;
using FLORAX.Shared.Responses;
using Microsoft.AspNetCore.Mvc;

namespace FLORAX.API.Controllers;

public class SoilMoistureController : ApiControllerBase
{
    [HttpGet("zone/{zoneId}")]
    public async Task<ActionResult<ApiResponse<List<SoilMoistureReadingDto>>>> GetMoistureByZone(Guid zoneId)
    {
        var readings = await Mediator.Send(new GetMoistureReadingsQuery(zoneId));
        return Ok(ApiResponse<List<SoilMoistureReadingDto>>.Success(readings, "Moisture readings retrieved successfully."));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<Guid>>> CreateMoisture(CreateMoistureReadingCommand command)
    {
        var id = await Mediator.Send(command);
        return Ok(ApiResponse<Guid>.Success(id, "Moisture reading logged successfully."));
    }
}
