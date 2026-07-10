namespace FLORAX.Application.DTOs;

public class LoginResultDto
{
    public UserDto User { get; set; } = null!;
    public string Token { get; set; } = null!;
}
