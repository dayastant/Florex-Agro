using System;
using System.Collections.Generic;
using FLORAX.Domain.Common;

namespace FLORAX.Domain.Entities;

public class IrrigationZone : BaseEntity
{
    public Guid FarmId { get; set; }
    public Farm Farm { get; set; }

    public string ZoneName { get; set; }
    public string CropType { get; set; }
    public string SoilType { get; set; }
    public decimal Area { get; set; }
    public string Status { get; set; }

    public ICollection<SensorDevice> SensorDevices { get; set; } = new List<SensorDevice>();
    public ICollection<ValveController> ValveControllers { get; set; } = new List<ValveController>();
    public ICollection<SoilMoistureReading> SoilMoistureReadings { get; set; } = new List<SoilMoistureReading>();
    public ICollection<IrrigationSchedule> IrrigationSchedules { get; set; } = new List<IrrigationSchedule>();
    public ICollection<IrrigationHistory> IrrigationHistories { get; set; } = new List<IrrigationHistory>();
    public ICollection<WaterUsageReport> WaterUsageReports { get; set; } = new List<WaterUsageReport>();
}
