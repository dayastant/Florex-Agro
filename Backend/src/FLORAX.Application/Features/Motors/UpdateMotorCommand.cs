using System;
using System.Threading;
using System.Threading.Tasks;
using FLORAX.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FLORAX.Application.Features.Motors;

public record UpdateMotorCommand : IRequest<bool>
{
    public Guid Id { get; set; }
    public bool IsRunning { get; set; }
    public decimal? Speed { get; set; }
}

public class UpdateMotorCommandHandler : IRequestHandler<UpdateMotorCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public UpdateMotorCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(UpdateMotorCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.Motors
            .FirstOrDefaultAsync(m => m.Id == request.Id, cancellationToken);

        if (entity == null)
            return false;

        entity.Status = request.IsRunning ? "Running" : "Stopped";
        entity.LastModified = DateTime.UtcNow;
        entity.LastModifiedBy = "System";

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
