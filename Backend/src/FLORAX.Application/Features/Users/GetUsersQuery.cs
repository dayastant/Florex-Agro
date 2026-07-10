using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FLORAX.Application.Common.Interfaces;
using FLORAX.Application.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FLORAX.Application.Features.Users;

public record GetUsersQuery : IRequest<List<UserDto>>;

public class GetUsersQueryHandler : IRequestHandler<GetUsersQuery, List<UserDto>>
{
    private readonly IApplicationDbContext _context;

    public GetUsersQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<UserDto>> Handle(GetUsersQuery request, CancellationToken cancellationToken)
    {
        return await _context.Users
            .Select(u => new UserDto
            {
                Id = u.Id,
                RoleId = u.RoleId,
                FullName = u.FullName,
                Email = u.Email,
                Phone = u.Phone,
                Status = u.Status,
                Created = u.Created
            })
            .ToListAsync(cancellationToken);
    }
}
