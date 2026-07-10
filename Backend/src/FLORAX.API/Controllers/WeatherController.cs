using System.Collections.Generic;
using System.Threading.Tasks;
using FLORAX.Application.DTOs;
using FLORAX.Application.Features.Weather;
using FLORAX.Shared.Responses;
using Microsoft.AspNetCore.Mvc;

namespace FLORAX.API.Controllers;

public class WeatherController : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<WeatherDataDto>>>> Get()
    {
        var readings = await Mediator.Send(new GetWeatherDataQuery());
        return Ok(ApiResponse<List<WeatherDataDto>>.Success(readings, "Weather readings retrieved successfully."));
    }
}
