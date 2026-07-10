# FLORAX AGROPIX - Smart Irrigation Management System

FLORAX AGROPIX is an enterprise-grade Smart Irrigation Management System built with **ASP.NET Core Web API** using the principles of **Clean Architecture** (Domain, Application, Infrastructure, and API).

---

## 🏗️ Project Architecture

The project is divided into four main layers following the Clean Architecture paradigm:

*   **Domain**: Contains enterprise business rules, entities, enums, constants, value objects, events, and interfaces. Totally decoupled from external frameworks.
*   **Application**: Contains MediatR pipeline behaviors (Logging, Validation, Exception Handling), custom exceptions, mapping profiles, DTOs, and CQRS features.
*   **Infrastructure**: Handles persistence (Entity Framework Core with MySQL/MariaDB), repository implementations, identity verification, JWT generation, SMS/Email dispatchers, MQTT communication gateways, memory caching, and Hosted Background services.
*   **API**: Exposes RESTful web services via controllers, registers custom exception/logging middlewares, CORS settings, Swagger generation, and JWT token authentication filter pipelines.

---

## 🚀 Getting Started

### Prerequisites
*   [.NET 10 SDK](https://dotnet.microsoft.com/download)
*   [MySQL / MariaDB Server](https://www.apachefriends.org/index.html) (Default: XAMPP MySQL running on port `3306`)

### Running the API locally
1. Clone the repository and navigate to the project directory:
   ```bash
   cd Backend
   ```
2. Build the solution:
   ```bash
   dotnet build
   ```
3. Apply Entity Framework migrations to MySQL:
   ```bash
   dotnet ef database update --project src/FLORAX.Infrastructure --startup-project src/FLORAX.API
   ```
4. Start the Web API:
   ```bash
   dotnet run --project src/FLORAX.API/FLORAX.API.csproj
   ```
5. Open Swagger UI at `https://localhost:5001/swagger` (or configured launching URL).
