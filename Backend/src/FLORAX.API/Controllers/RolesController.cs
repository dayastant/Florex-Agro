using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FLORAX.Application.DTOs;
using FLORAX.Shared.Responses;
using Microsoft.AspNetCore.Mvc;

namespace FLORAX.API.Controllers;

public class RolesController : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<RoleDto>>>> Get()
    {
        return Ok(ApiResponse<List<RoleDto>>.Success(new List<RoleDto>(), "Roles retrieved successfully."));
    }
}
