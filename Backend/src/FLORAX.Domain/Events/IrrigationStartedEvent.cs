using System;
using FLORAX.Domain.Common;
using FLORAX.Domain.Entities;

namespace FLORAX.Domain.Events;

public class IrrigationStartedEvent : BaseEvent
{
    public IrrigationHistory History { get; }

    public IrrigationStartedEvent(IrrigationHistory history)
    {
        History = history;
    }
}
