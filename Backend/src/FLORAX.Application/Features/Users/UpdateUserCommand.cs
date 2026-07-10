using System;
using System.Threading;
using System.Threading.Tasks;
using FLORAX.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FLORAX.Application.Features.Users;

public record UpdateUserCommand : IRequest<bool>
{
    public Guid Id { get; set; }
    public string FullName { get; set; }
    public string Email { get; set; }
    public string Phone { get; set; }
    public Guid RoleId { get; set; }
    public string? Status { get; set; }
    public string? Password { get; set; }
}

public class UpdateUserCommandHandler : IRequestHandler<UpdateUserCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public UpdateUserCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(UpdateUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == request.Id, cancellationToken);
        if (user == null)
            return false;

        user.FullName = request.FullName;
        user.Email = request.Email;
        user.Phone = request.Phone;
        user.RoleId = request.RoleId;
        if (!string.IsNullOrEmpty(request.Status))
        {
            user.Status = request.Status;
        }
        if (!string.IsNullOrEmpty(request.Password))
        {
            user.PasswordHash = FLORAX.Shared.Utilities.EncryptionUtility.HashSha256(request.Password);
        }
        user.LastModifiedBy = "System";
        user.LastModified = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
