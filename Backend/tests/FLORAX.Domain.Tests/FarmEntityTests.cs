using FLORAX.Domain.Entities;
using Xunit;

namespace FLORAX.Domain.Tests;

public class FarmEntityTests
{
    [Fact]
    public void Farm_Should_Initialize_SensorDevicesCollection()
    {
        // Arrange & Act
        var farm = new Farm();

        // Assert
        Assert.NotNull(farm.IrrigationZones);
        Assert.Empty(farm.IrrigationZones);
    }
}
