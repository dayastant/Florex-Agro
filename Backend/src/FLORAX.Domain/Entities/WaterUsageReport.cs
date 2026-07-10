using System;
using FLORAX.Domain.Common;

namespace FLORAX.Domain.Entities;

public class WaterUsageReport : BaseEntity
{
    public Guid FarmId { get; set; }
    public Farm Farm { get; set; }

    public Guid ZoneId { get; set; }
    public IrrigationZone Zone { get; set; }

    public DateOnly ReportDate { get; set; }
    public decimal TotalWaterUsed { get; set; }
    public decimal AverageMoisture { get; set; }
    public int IrrigationCount { get; set; }
}
