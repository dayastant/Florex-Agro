using System;
using FLORAX.Application.Common.Mappings;
using FLORAX.Domain.Entities;

namespace FLORAX.Application.DTOs;

public class AuditLogDto : IMapFrom<AuditLog>
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Action { get; set; }
    public string TableName { get; set; }
    public Guid RecordId { get; set; }
    public string IpAddress { get; set; }
}
