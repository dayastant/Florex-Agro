using System;

namespace FLORAX.Application.Common.Utilities;

public static class DateTimeHelper
{
    public static DateTime StartOfDay(DateTime date)
    {
        return new DateTime(date.Year, date.Month, date.Day, 0, 0, 0, DateTimeKind.Utc);
    }

    public static DateTime EndOfDay(DateTime date)
    {
        return new DateTime(date.Year, date.Month, date.Day, 23, 59, 59, 999, DateTimeKind.Utc);
    }

    public static bool IsInRange(DateTime checkDate, DateTime startDate, DateTime endDate)
    {
        return checkDate >= startDate && checkDate <= endDate;
    }
}
