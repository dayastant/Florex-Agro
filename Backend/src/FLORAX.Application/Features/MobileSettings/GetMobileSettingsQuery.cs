using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FLORAX.Application.Common.Interfaces;
using FLORAX.Application.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FLORAX.Application.Features.MobileSettings;

public record GetMobileSettingsQuery : IRequest<List<MobileAppSettingsDto>>;

public class GetMobileSettingsQueryHandler : IRequestHandler<GetMobileSettingsQuery, List<MobileAppSettingsDto>>
{
    private readonly IApplicationDbContext _context;

    public GetMobileSettingsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<MobileAppSettingsDto>> Handle(GetMobileSettingsQuery request, CancellationToken cancellationToken)
    {
        return await _context.MobileAppSettings
            .Select(m => new MobileAppSettingsDto
            {
                Id = m.Id,
                UserId = m.UserId,
                Language = m.Language,
                Theme = m.Theme,
                NotificationEnabled = m.NotificationEnabled,
                AutoSync = m.AutoSync
            })
            .ToListAsync(cancellationToken);
    }
}
