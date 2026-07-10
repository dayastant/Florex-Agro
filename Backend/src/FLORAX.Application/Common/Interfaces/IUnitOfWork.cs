using System;
using System.Threading;
using System.Threading.Tasks;
using FLORAX.Domain.Common;

namespace FLORAX.Application.Common.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IRepository<T> Repository<T>() where T : BaseEntity;
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
