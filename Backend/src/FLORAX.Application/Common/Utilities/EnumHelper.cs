using System;
using System.Collections.Generic;
using System.Linq;

namespace FLORAX.Application.Common.Utilities;

public static class EnumHelper
{
    public static T Parse<T>(string value, bool ignoreCase = true) where T : struct, Enum
    {
        return Enum.TryParse<T>(value, ignoreCase, out var result) ? result : default;
    }

    public static Dictionary<int, string> ToDictionary<T>() where T : struct, Enum
    {
        return Enum.GetValues(typeof(T))
            .Cast<T>()
            .ToDictionary(e => Convert.ToInt32(e), e => e.ToString());
    }
}
