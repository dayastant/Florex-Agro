using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FLORAX.Application.DTOs;
using FLORAX.Shared.Responses;
using Microsoft.AspNetCore.Mvc;

namespace FLORAX.API.Controllers;

public class IrrigationHistoryController : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<IrrigationHistoryDto>>>> Get()
    {
        return Ok(ApiResponse<List<IrrigationHistoryDto>>.Success(new List<IrrigationHistoryDto>(), "Irrigation history retrieved successfully."));
    }
}
