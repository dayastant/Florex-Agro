using System;
using FLORAX.Domain.Common;
using FLORAX.Domain.Entities;

namespace FLORAX.Domain.Events;

public class IrrigationEndedEvent : BaseEvent
{
    public IrrigationHistory History { get; }
    public decimal WaterUsed { get; }

    public IrrigationEndedEvent(IrrigationHistory history, decimal waterUsed)
    {
        History = history;
        WaterUsed = waterUsed;
    }
}
