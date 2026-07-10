using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FLORAX.Application.Common.Interfaces;
using FLORAX.Domain.Entities;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace FLORAX.Infrastructure.JWT;

public class JwtTokenGenerator : ITokenService
{
    private readonly JwtSettings _jwtSettings;

    public JwtTokenGenerator(IOptions<JwtSettings> jwtOptions)
    {
        _jwtSettings = jwtOptions.Value;
    }

    public string GenerateToken(User user, string roleName)
    {
        var secret = string.IsNullOrEmpty(_jwtSettings?.Secret) 
            ? "super_secret_key_that_is_at_least_32_characters_long_for_hmac_sha256" 
            : _jwtSettings.Secret;
        var issuer = string.IsNullOrEmpty(_jwtSettings?.Issuer) ? "FLORAX.API" : _jwtSettings.Issuer;
        var audience = string.IsNullOrEmpty(_jwtSettings?.Audience) ? "FLORAX.Client" : _jwtSettings.Audience;
        var expiry = _jwtSettings == null || _jwtSettings.ExpiryMinutes == 0 ? 1440 : _jwtSettings.ExpiryMinutes;

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.Name, user.FullName),
            new Claim(ClaimTypes.Role, roleName),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expiry),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
