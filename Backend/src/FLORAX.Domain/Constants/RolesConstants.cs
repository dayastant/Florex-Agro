using System;

namespace FLORAX.Domain.Constants;

public static class RolesConstants
{
    public const string SuperAdmin = "SuperAdmin";
    public const string Administrator = "Administrator";
    public const string Farmer = "Farmer";
    public const string Technician = "Technician";

    public static readonly Guid SuperAdminId = Guid.Parse("44444444-4444-4444-4444-444444444444");
    public static readonly Guid AdministratorId = Guid.Parse("11111111-1111-1111-1111-111111111111");
    public static readonly Guid FarmerId = Guid.Parse("22222222-2222-2222-2222-222222222222");
    public static readonly Guid TechnicianId = Guid.Parse("33333333-3333-3333-3333-333333333333");
}
