using System;
using System.Collections.Generic;

namespace FLORAX.Application.Common.Responses;

public class PaginationResponse<T>
{
    public IReadOnlyList<T> Items { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
    public int TotalRecords { get; set; }

    public bool HasPreviousPage => PageNumber > 1;
    public bool HasNextPage => PageNumber < TotalPages;

    public PaginationResponse()
    {
    }

    public PaginationResponse(IReadOnlyList<T> items, int count, int pageNumber, int pageSize)
    {
        Items = items;
        PageNumber = pageNumber;
        PageSize = pageSize;
        TotalRecords = count;
        TotalPages = (int)Math.Ceiling(count / (double)pageSize);
    }
}
