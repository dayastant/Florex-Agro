using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FLORAX.Application.DTOs;
using FLORAX.Application.Features.IrrigationSchedules;
using FLORAX.Shared.Responses;
using Microsoft.AspNetCore.Mvc;

namespace FLORAX.API.Controllers;

public class IrrigationSchedulesController : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<IrrigationScheduleDto>>>> GetAll()
    {
        var schedules = await Mediator.Send(new GetAllSchedulesQuery());
        return Ok(ApiResponse<List<IrrigationScheduleDto>>.Success(schedules, "Schedules retrieved successfully."));
    }

    [HttpGet("zone/{zoneId}")]
    public async Task<ActionResult<ApiResponse<List<IrrigationScheduleDto>>>> GetByZone(Guid zoneId)
    {
        var schedules = await Mediator.Send(new GetSchedulesQuery(zoneId));
        return Ok(ApiResponse<List<IrrigationScheduleDto>>.Success(schedules, "Schedules retrieved successfully."));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<Guid>>> Create(CreateScheduleCommand command)
    {
        var id = await Mediator.Send(command);
        return Ok(ApiResponse<Guid>.Success(id, "Schedule created successfully."));
    }

    [HttpPatch("{id}")]
    public async Task<ActionResult<ApiResponse<bool>>> Toggle(Guid id, [FromBody] ToggleScheduleCommand command)
    {
        command.Id = id;
        var result = await Mediator.Send(command);
        if (!result)
            return NotFound(ApiResponse<bool>.Failure("Schedule not found."));

        return Ok(ApiResponse<bool>.Success(true, "Schedule updated successfully."));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(Guid id)
    {
        var result = await Mediator.Send(new DeleteScheduleCommand { Id = id });
        if (!result)
            return NotFound(ApiResponse<bool>.Failure("Schedule not found."));

        return Ok(ApiResponse<bool>.Success(true, "Schedule deleted successfully."));
    }
}
