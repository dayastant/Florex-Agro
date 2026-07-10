using System.Collections.Generic;
using System.Threading.Tasks;
using FLORAX.Application.DTOs;
using FLORAX.Application.Features.Notifications;
using FLORAX.Shared.Responses;
using Microsoft.AspNetCore.Mvc;

namespace FLORAX.API.Controllers;

public class NotificationsController : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<NotificationDto>>>> Get()
    {
        var notifications = await Mediator.Send(new GetNotificationsQuery());
        return Ok(ApiResponse<List<NotificationDto>>.Success(notifications, "Notifications retrieved successfully."));
    }

    [HttpPut("{id}/resolve")]
    public async Task<ActionResult<ApiResponse<bool>>> Resolve(Guid id)
    {
        var result = await Mediator.Send(new ResolveNotificationCommand { Id = id });
        if (!result)
            return NotFound(ApiResponse<bool>.Failure("Alert not found."));

        return Ok(ApiResponse<bool>.Success(true, "Alert resolved successfully."));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<Guid>>> Create([FromBody] CreateNotificationCommand command)
    {
        var id = await Mediator.Send(command);
        return Ok(ApiResponse<Guid>.Success(id, "Notification sent successfully."));
    }
}
