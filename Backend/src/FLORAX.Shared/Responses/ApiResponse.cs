using System.Collections.Generic;

namespace FLORAX.Shared.Responses;

public class ApiResponse<T>
{
    public bool Succeeded { get; set; }
    public string Message { get; set; }
    public T Data { get; set; }
    public List<string> Errors { get; set; } = new();

    public ApiResponse()
    {
    }

    public ApiResponse(T data, string message = null)
    {
        Succeeded = true;
        Message = message;
        Data = data;
    }

    public ApiResponse(string message, List<string> errors = null)
    {
        Succeeded = false;
        Message = message;
        if (errors != null)
        {
            Errors = errors;
        }
    }

    public static ApiResponse<T> Success(T data, string message = null) => new(data, message);
    public static ApiResponse<T> Failure(string message, List<string> errors = null) => new(message, errors);
}
