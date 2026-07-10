using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FLORAX.Application.Common.Interfaces;
using FLORAX.Domain.Entities;
using FLORAX.Shared.Utilities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FLORAX.Application.Features.Authentication;

public record RegisterCommand : IRequest<Guid>
{
    public string FullName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Phone { get; set; } = null!;
    public string Password { get; set; } = null!;
    public Guid RoleId { get; set; }
}

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public RegisterCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        var exists = await _context.Users.AnyAsync(u => u.Email == request.Email, cancellationToken);
        if (exists)
            throw new ArgumentException("User with this email already exists.");

        var user = new User
        {
            FullName = request.FullName,
            Email = request.Email,
            Phone = request.Phone,
            PasswordHash = EncryptionUtility.HashSha256(request.Password),
            RoleId = request.RoleId,
            Status = "Active",
            CreatedBy = "System",
            LastModifiedBy = "System"
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync(cancellationToken);

        return user.Id;
    }
}
