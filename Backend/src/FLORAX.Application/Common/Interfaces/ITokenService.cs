using FLORAX.Domain.Entities;

namespace FLORAX.Application.Common.Interfaces;

public interface ITokenService
{
    string GenerateToken(User user, string roleName);
}
