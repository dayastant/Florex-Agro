# Backend architecture convention

- Place all DTO classes in the DTOs folder under the application layer.
- Feature handlers and commands should use DTOs from FLORAX.Application.DTOs rather than defining DTO classes inside feature files.
- For future backend work, keep feature-specific response objects in the shared DTOs folder and import them with `using FLORAX.Application.DTOs;`.
