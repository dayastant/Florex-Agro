using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FLORAX.Application.Common.Responses;
using Microsoft.EntityFrameworkCore;

namespace FLORAX.Application.Common.Utilities;

public static class PaginationHelper
{
    public static async Task<PaginationResponse<T>> CreateAsync<T>(
        IQueryable<T> source, int pageNumber, int pageSize, CancellationToken cancellationToken = default)
    {
        var count = await source.CountAsync(cancellationToken);
        var items = await source.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToken);

        return new PaginationResponse<T>(items, count, pageNumber, pageSize);
    }
}
