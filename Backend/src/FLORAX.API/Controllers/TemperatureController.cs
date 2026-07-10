using System.Collections.Generic;
using System.Threading.Tasks;
using FLORAX.Application.DTOs;
using FLORAX.Application.Features.Temperature;
using FLORAX.Shared.Responses;
using Microsoft.AspNetCore.Mvc;

namespace FLORAX.API.Controllers;

public class TemperatureController : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<TemperatureReadingDto>>>> Get()
    {
        var readings = await Mediator.Send(new GetTemperatureReadingsQuery());
        return Ok(ApiResponse<List<TemperatureReadingDto>>.Success(readings, "Temperature readings retrieved successfully."));
    }
}
