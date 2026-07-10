using System.Collections.Generic;
using FLORAX.Domain.Common;

namespace FLORAX.Domain.Entities;

public class Role : BaseEntity
{
    public string RoleName { get; set; }
    public string Description { get; set; }

    public ICollection<User> Users { get; set; } = new List<User>();
}
