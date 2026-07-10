using System.Threading.Tasks;
using FLORAX.Application.DTOs;
using FLORAX.Application.Features.Dashboard;
using FLORAX.Shared.Responses;
using Microsoft.AspNetCore.Mvc;

namespace FLORAX.API.Controllers;

public class DashboardController : ApiControllerBase
{
    [HttpGet("summary")]
    public async Task<ActionResult<ApiResponse<DashboardSummaryDto>>> GetSummary()
    {
        var summary = await Mediator.Send(new GetDashboardSummaryQuery());
        return Ok(ApiResponse<DashboardSummaryDto>.Success(summary, "Dashboard summary retrieved successfully."));
    }
}
