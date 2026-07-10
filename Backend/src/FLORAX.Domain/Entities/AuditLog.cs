using System;
using FLORAX.Domain.Common;

namespace FLORAX.Domain.Entities;

public class AuditLog : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; }

    public string Action { get; set; }
    public string TableName { get; set; }
    public Guid RecordId { get; set; }
    public string IpAddress { get; set; }
}
