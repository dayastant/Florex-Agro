namespace FLORAX.API.Helpers;

public static class ApiHelper
{
    public static string FormatApiRoute(string controllerName) => $"api/v1/{controllerName}";
}
