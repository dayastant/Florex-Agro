namespace FLORAX.Application.DTOs;

public class DashboardSummaryDto
{
    public int TotalFarms { get; set; }
    public int TotalZones { get; set; }
    public int ActiveSensors { get; set; }
    public decimal AverageMoisture { get; set; }
    public string SystemStatus { get; set; } = string.Empty;
}
