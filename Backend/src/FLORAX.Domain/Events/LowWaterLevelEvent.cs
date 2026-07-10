using System;
using FLORAX.Domain.Common;
using FLORAX.Domain.Entities;

namespace FLORAX.Domain.Events;

public class LowWaterLevelEvent : BaseEvent
{
    public WaterTank Tank { get; }
    public decimal CurrentLevel { get; }

    public LowWaterLevelEvent(WaterTank tank, decimal currentLevel)
    {
        Tank = tank;
        CurrentLevel = currentLevel;
    }
}
