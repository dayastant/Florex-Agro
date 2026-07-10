using System;
using System.Threading;
using System.Threading.Tasks;
using FLORAX.Application.Common.Interfaces;
using FLORAX.Domain.Entities;
using MediatR;

namespace FLORAX.Application.Features.IrrigationSchedules;

public record CreateScheduleCommand : IRequest<Guid>
{
    public Guid ZoneId { get; set; }
    public Guid CreatedBy { get; set; }
    public TimeSpan StartTime { get; set; }
    public int DurationMinutes { get; set; }
    public string RepeatType { get; set; } = null!;
    public bool Enabled { get; set; }
}

public class CreateScheduleCommandHandler : IRequestHandler<CreateScheduleCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateScheduleCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateScheduleCommand request, CancellationToken cancellationToken)
    {
        var entity = new IrrigationSchedule
        {
            Id = Guid.NewGuid(),
            ZoneId = request.ZoneId,
            CreatedBy = request.CreatedBy,
            StartTime = request.StartTime,
            DurationMinutes = request.DurationMinutes,
            RepeatType = request.RepeatType,
            Enabled = request.Enabled,
            Created = DateTime.UtcNow,
            LastModified = DateTime.UtcNow,
            LastModifiedBy = request.CreatedBy.ToString()
        };

        _context.IrrigationSchedules.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
