using System;
using System.Threading;
using System.Threading.Tasks;
using FLORAX.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FLORAX.Application.Features.Notifications;

public record ResolveNotificationCommand : IRequest<bool>
{
    public Guid Id { get; set; }
}

public class ResolveNotificationCommandHandler : IRequestHandler<ResolveNotificationCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public ResolveNotificationCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(ResolveNotificationCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == request.Id, cancellationToken);

        if (entity == null)
            return false;

        entity.IsRead = true;
        entity.LastModified = DateTime.UtcNow;
        entity.LastModifiedBy = "System";

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
