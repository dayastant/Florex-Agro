using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FLORAX.Application.DTOs;
using FLORAX.Application.Features.Users;
using FLORAX.Shared.Responses;
using Microsoft.AspNetCore.Mvc;

namespace FLORAX.API.Controllers;

public class UsersController : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<UserDto>>>> Get()
    {
        var users = await Mediator.Send(new GetUsersQuery());
        return Ok(ApiResponse<List<UserDto>>.Success(users, "Users retrieved successfully."));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<bool>>> Update(Guid id, [FromBody] UpdateUserCommand command)
    {
        if (id != command.Id)
            return BadRequest(ApiResponse<bool>.Failure("ID mismatch."));

        var result = await Mediator.Send(command);
        if (!result)
            return NotFound(ApiResponse<bool>.Failure("User not found."));

        return Ok(ApiResponse<bool>.Success(true, "User updated successfully."));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(Guid id)
    {
        var result = await Mediator.Send(new DeleteUserCommand { Id = id });
        if (!result)
            return NotFound(ApiResponse<bool>.Failure("User not found."));

        return Ok(ApiResponse<bool>.Success(true, "User deleted successfully."));
    }
}
