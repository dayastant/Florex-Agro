using System;
using FLORAX.Application.Common.Interfaces;

namespace FLORAX.Infrastructure.Services;

public class DateTimeService : IDateTimeService
{
    public DateTime UtcNow => DateTime.UtcNow;
}
