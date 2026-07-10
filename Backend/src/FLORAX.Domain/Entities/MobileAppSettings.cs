using System;
using FLORAX.Domain.Common;

namespace FLORAX.Domain.Entities;

public class MobileAppSettings : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; }

    public string Language { get; set; }
    public string Theme { get; set; }
    public bool NotificationEnabled { get; set; }
    public bool AutoSync { get; set; }
}
