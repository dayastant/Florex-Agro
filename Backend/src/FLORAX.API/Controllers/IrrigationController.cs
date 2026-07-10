using System.Threading.Tasks;
using FLORAX.Application.Features.IrrigationHistory;
using FLORAX.Shared.Responses;
using Microsoft.AspNetCore.Mvc;

namespace FLORAX.API.Controllers;

public class IrrigationController : ApiControllerBase
{
    [HttpPost("manual/start")]
    public async Task<ActionResult<ApiResponse<bool>>> StartManual([FromBody] StartManualIrrigationCommand command)
    {
        var result = await Mediator.Send(command);
        if (!result)
            return NotFound(ApiResponse<bool>.Failure("Zone not found."));

        return Ok(ApiResponse<bool>.Success(true, "Manual irrigation started successfully."));
    }

    [HttpPost("manual/stop")]
    public async Task<ActionResult<ApiResponse<bool>>> StopManual([FromBody] StopManualIrrigationCommand command)
    {
        var result = await Mediator.Send(command);
        if (!result)
            return NotFound(ApiResponse<bool>.Failure("Zone not found."));

        return Ok(ApiResponse<bool>.Success(true, "Manual irrigation stopped successfully."));
    }
}
