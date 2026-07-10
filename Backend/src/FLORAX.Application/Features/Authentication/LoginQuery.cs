using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FLORAX.Application.Common.Interfaces;
using FLORAX.Application.DTOs;
using FLORAX.Shared.Utilities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FLORAX.Application.Features.Authentication;

public record LoginQuery : IRequest<LoginResultDto>
{
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
}

public class LoginQueryHandler : IRequestHandler<LoginQuery, LoginResultDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ITokenService _tokenService;

    public LoginQueryHandler(IApplicationDbContext context, ITokenService tokenService)
    {
        _context = context;
        _tokenService = tokenService;
    }

    public async Task<LoginResultDto> Handle(LoginQuery request, CancellationToken cancellationToken)
    {
        var passwordHash = EncryptionUtility.HashSha256(request.Password);

        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Email == request.Email && u.PasswordHash == passwordHash, cancellationToken);

        if (user == null)
            throw new UnauthorizedAccessException("Invalid email or password.");

        var roleName = user.Role?.RoleName ?? "User";
        var token = _tokenService.GenerateToken(user, roleName);

        var userDto = new UserDto
        {
            Id = user.Id,
            RoleId = user.RoleId,
            FullName = user.FullName,
            Email = user.Email,
            Phone = user.Phone,
            Status = user.Status,
            Created = user.Created
        };

        return new LoginResultDto
        {
            User = userDto,
            Token = token
        };
    }
}
