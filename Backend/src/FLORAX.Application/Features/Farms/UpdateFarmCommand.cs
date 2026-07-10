using System;
using System.Threading;
using System.Threading.Tasks;
using FLORAX.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FLORAX.Application.Features.Farms;

public record UpdateFarmCommand : IRequest<bool>
{
    public Guid Id { get; set; }
    public string FarmName { get; set; }
    public string District { get; set; }
    public string Province { get; set; }
    public decimal TotalArea { get; set; }
}

public class UpdateFarmCommandHandler : IRequestHandler<UpdateFarmCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public UpdateFarmCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(UpdateFarmCommand request, CancellationToken cancellationToken)
    {
        var farm = await _context.Farms.FirstOrDefaultAsync(f => f.Id == request.Id, cancellationToken);
        if (farm == null)
            return false;

        farm.FarmName = request.FarmName;
        farm.District = request.District;
        farm.Province = request.Province;
        farm.TotalArea = request.TotalArea;
        farm.LastModifiedBy = "System";
        farm.LastModified = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
