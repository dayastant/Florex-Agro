using System;

namespace FLORAX.Domain.ValueObjects;

public record Firmware
{
    public int Major { get; }
    public int Minor { get; }
    public int Patch { get; }

    public Firmware(int major, int minor, int patch)
    {
        if (major < 0 || minor < 0 || patch < 0)
            throw new ArgumentException("Version numbers cannot be negative.");

        Major = major;
        Minor = minor;
        Patch = patch;
    }

    public override string ToString() => $"{Major}.{Minor}.{Patch}";
}
