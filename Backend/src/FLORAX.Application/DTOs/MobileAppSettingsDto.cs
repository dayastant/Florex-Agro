using System;
using FLORAX.Application.Common.Mappings;
using FLORAX.Domain.Entities;

namespace FLORAX.Application.DTOs;

public class MobileAppSettingsDto : IMapFrom<MobileAppSettings>
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Language { get; set; }
    public string Theme { get; set; }
    public bool NotificationEnabled { get; set; }
    public bool AutoSync { get; set; }
}
