using System.Collections.Generic;

namespace FLORAX.Application.Common.Responses;

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string Message { get; set; }
    public T Data { get; set; }
    public List<string> Errors { get; set; } = new();
    public int StatusCode { get; set; }

    public ApiResponse()
    {
    }

    public ApiResponse(T data, string message = null, int statusCode = 200)
    {
        Success = true;
        Message = message;
        Data = data;
        StatusCode = statusCode;
    }

    public ApiResponse(string message, List<string> errors = null, int statusCode = 400)
    {
        Success = false;
        Message = message;
        StatusCode = statusCode;
        if (errors != null)
        {
            Errors = errors;
        }
    }

    public static ApiResponse<T> CreateSuccess(T data, string message = null, int statusCode = 200) 
        => new(data, message, statusCode);
        
    public static ApiResponse<T> CreateFailure(string message, List<string> errors = null, int statusCode = 400) 
        => new(message, errors, statusCode);
}
