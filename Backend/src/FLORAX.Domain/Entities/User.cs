using System;
using System.Collections.Generic;
using FLORAX.Domain.Common;

namespace FLORAX.Domain.Entities;

public class User : BaseEntity
{
    public Guid RoleId { get; set; }
    public Role Role { get; set; }

    public string FullName { get; set; }
    public string Email { get; set; }
    public string Phone { get; set; }
    public string PasswordHash { get; set; }
    public string Status { get; set; }

    public ICollection<Farm> Farms { get; set; } = new List<Farm>();
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    public ICollection<MobileAppSettings> MobileAppSettings { get; set; } = new List<MobileAppSettings>();
    public ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();
    public ICollection<IrrigationSchedule> IrrigationSchedules { get; set; } = new List<IrrigationSchedule>();
}
