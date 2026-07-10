using System;
using System.Collections.Generic;
using FLORAX.Domain.Common;

namespace FLORAX.Domain.Entities;

public class Motor : BaseEntity
{
    public Guid FarmId { get; set; }
    public Farm Farm { get; set; }

    public string MotorName { get; set; }
    public string PowerRating { get; set; }
    public string Status { get; set; }
    public decimal RuntimeHours { get; set; }

    public ICollection<IrrigationHistory> IrrigationHistories { get; set; } = new List<IrrigationHistory>();
}
