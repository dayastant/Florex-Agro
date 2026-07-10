using System;

namespace FLORAX.Shared.Models;

public class UserSessionModel
{
    public Guid UserId { get; set; }
    public string Email { get; set; }
    public string FullName { get; set; }
    public string RoleName { get; set; }
}
