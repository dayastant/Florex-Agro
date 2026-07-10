using System;
using System.Text.RegularExpressions;

namespace FLORAX.Application.Common.Utilities;

public static class StringHelper
{
    public static string Truncate(string value, int maxLength, string suffix = "...")
    {
        if (string.IsNullOrEmpty(value)) return value;
        return value.Length <= maxLength ? value : value[..maxLength] + suffix;
    }

    public static string MaskEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email)) return email;
        var parts = email.Split('@');
        if (parts.Length != 2) return email;

        var name = parts[0];
        var domain = parts[1];

        if (name.Length <= 2) return name[0] + "***@" + domain;
        return name[0] + new string('*', name.Length - 2) + name[^1] + "@" + domain;
    }

    public static bool IsValidEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email)) return false;
        try
        {
            return Regex.IsMatch(email, 
                @"^[^@\s]+@[^@\s]+\.[^@\s]+$", 
                RegexOptions.IgnoreCase, TimeSpan.FromMilliseconds(250));
        }
        catch (RegexMatchTimeoutException)
        {
            return false;
        }
    }
}
