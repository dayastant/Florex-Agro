using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FLORAX.Application.DTOs;
using FLORAX.Shared.Responses;
using Microsoft.AspNetCore.Mvc;

namespace FLORAX.API.Controllers;

public class ReportsController : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<WaterUsageReportDto>>>> Get()
    {
        return Ok(ApiResponse<List<WaterUsageReportDto>>.Success(new List<WaterUsageReportDto>(), "Reports retrieved successfully."));
    }
}
