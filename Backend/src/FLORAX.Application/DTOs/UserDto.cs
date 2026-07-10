using System;
using FLORAX.Application.Common.Mappings;
using FLORAX.Domain.Entities;

namespace FLORAX.Application.DTOs;

public class UserDto : IMapFrom<User>
{
    public Guid Id { get; set; }
    public Guid RoleId { get; set; }
    public string FullName { get; set; }
    public string Email { get; set; }
    public string Phone { get; set; }
    public string Status { get; set; }
    public DateTime Created { get; set; }
}
