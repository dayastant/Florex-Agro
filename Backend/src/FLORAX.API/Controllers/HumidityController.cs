using System.Collections.Generic;
using System.Threading.Tasks;
using FLORAX.Application.DTOs;
using FLORAX.Application.Features.Humidity;
using FLORAX.Shared.Responses;
using Microsoft.AspNetCore.Mvc;

namespace FLORAX.API.Controllers;

public class HumidityController : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<HumidityReadingDto>>>> Get()
    {
        var readings = await Mediator.Send(new GetHumidityReadingsQuery());
        return Ok(ApiResponse<List<HumidityReadingDto>>.Success(readings, "Humidity readings retrieved successfully."));
    }
}
