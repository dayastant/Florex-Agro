using System.Collections.Generic;
using System.Threading.Tasks;
using FLORAX.Application.DTOs;
using FLORAX.Application.Features.WaterLevels;
using FLORAX.Shared.Responses;
using Microsoft.AspNetCore.Mvc;

namespace FLORAX.API.Controllers;

public class WaterLevelsController : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<WaterLevelReadingDto>>>> Get()
    {
        var readings = await Mediator.Send(new GetWaterLevelsQuery());
        return Ok(ApiResponse<List<WaterLevelReadingDto>>.Success(readings, "Water level readings retrieved successfully."));
    }
}
