using System;
using FLORAX.Application.Common.Mappings;
using FLORAX.Domain.Entities;

namespace FLORAX.Application.DTOs;

public class WaterUsageReportDto : IMapFrom<WaterUsageReport>
{
    public Guid Id { get; set; }
    public Guid FarmId { get; set; }
    public Guid ZoneId { get; set; }
    public DateOnly ReportDate { get; set; }
    public decimal TotalWaterUsed { get; set; }
    public decimal AverageMoisture { get; set; }
    public int IrrigationCount { get; set; }
}
