using System;
using System.Security.Cryptography;
using System.Text;

namespace FLORAX.Shared.Utilities;

public static class EncryptionUtility
{
    public static string HashSha256(string value)
    {
        if (string.IsNullOrEmpty(value)) return value;
        
        var bytes = Encoding.UTF8.GetBytes(value);
        var hash = SHA256.HashData(bytes);
        
        return Convert.ToBase64String(hash);
    }
}
