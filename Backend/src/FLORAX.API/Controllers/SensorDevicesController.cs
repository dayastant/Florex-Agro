using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FLORAX.Application.DTOs;
using FLORAX.Application.Features.SensorDevices;
using FLORAX.Shared.Responses;
using Microsoft.AspNetCore.Mvc;

namespace FLORAX.API.Controllers;

public class SensorDevicesController : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<SensorDeviceDto>>>> Get()
    {
        var devices = await Mediator.Send(new GetAllSensorDevicesQuery());
        return Ok(ApiResponse<List<SensorDeviceDto>>.Success(devices, "All sensor devices retrieved successfully."));
    }

    [HttpGet("zone/{zoneId}")]
    public async Task<ActionResult<ApiResponse<List<SensorDeviceDto>>>> GetByZone(Guid zoneId)
    {
        var devices = await Mediator.Send(new GetSensorDevicesQuery(zoneId));
        return Ok(ApiResponse<List<SensorDeviceDto>>.Success(devices, "Sensor devices retrieved successfully."));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<Guid>>> Create(CreateSensorDeviceCommand command)
    {
        var id = await Mediator.Send(command);
        return Ok(ApiResponse<Guid>.Success(id, "Sensor device created successfully."));
    }

    [HttpPut("{id}/allocate")]
    public async Task<ActionResult<ApiResponse<bool>>> Allocate(Guid id, [FromBody] AllocateSensorDeviceCommand command)
    {
        if (id != command.SensorDeviceId)
            return BadRequest(ApiResponse<bool>.Failure("ID mismatch."));

        var result = await Mediator.Send(command);
        if (!result)
            return NotFound(ApiResponse<bool>.Failure("Sensor device not found."));

        return Ok(ApiResponse<bool>.Success(true, "Sensor device allocated successfully."));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<bool>>> Update(Guid id, [FromBody] UpdateSensorDeviceCommand command)
    {
        if (id != command.Id)
            return BadRequest(ApiResponse<bool>.Failure("ID mismatch."));

        var result = await Mediator.Send(command);
        if (!result)
            return NotFound(ApiResponse<bool>.Failure("Sensor device not found."));

        return Ok(ApiResponse<bool>.Success(true, "Sensor device updated successfully."));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(Guid id)
    {
        var result = await Mediator.Send(new DeleteSensorDeviceCommand { Id = id });
        if (!result)
            return NotFound(ApiResponse<bool>.Failure("Sensor device not found."));

        return Ok(ApiResponse<bool>.Success(true, "Sensor device deleted successfully."));
    }
}
