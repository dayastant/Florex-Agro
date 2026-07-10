using System;
using System.Threading.Tasks;
using FLORAX.Application.Common.Interfaces;
using FLORAX.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FLORAX.Infrastructure.Identity;

public class IdentityService
{
    private readonly IApplicationDbContext _context;

    public IdentityService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> VerifyPasswordAsync(string email, string password)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null) return false;

        // In production, use robust password hashing like BCrypt or ASP.NET Core Cryptography.
        return user.PasswordHash == HashPassword(password);
    }

    public string HashPassword(string password)
    {
        return Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(password));
    }
}
