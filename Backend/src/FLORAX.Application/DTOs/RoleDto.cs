using System;
using FLORAX.Application.Common.Mappings;
using FLORAX.Domain.Entities;

namespace FLORAX.Application.DTOs;

public class RoleDto : IMapFrom<Role>
{
    public Guid Id { get; set; }
    public string RoleName { get; set; }
    public string Description { get; set; }
}
