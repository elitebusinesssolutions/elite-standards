# .NET Development Standards

## General Guidelines

### Framework and Language Standards

Follow Microsoft's official guidance:

- **C# Coding Conventions**:
  [Microsoft Learn - C# Coding Conventions](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/coding-style/coding-conventions)
- **Framework Design Guidelines**:
  [Microsoft Learn - Framework Design Guidelines](https://learn.microsoft.com/en-us/dotnet/standard/design-guidelines/)
- **Performance Best Practices**:
  [Microsoft Learn - .NET Performance](https://learn.microsoft.com/en-us/dotnet/framework/performance/)

### Current Standards

- **Target Framework**: .NET 8.0 (latest LTS)
- **Language Version**: Latest C# version
- **Nullable Reference Types**: Enabled
- **Implicit Usings**: Enabled

## Elite-Specific Conventions

### Project Naming

All projects follow the pattern: `{CompanyName}.{ProjectName}.{Layer}`

- Examples: `Elite.ProjectName.Core`, `Elite.ProjectName.Services`
- Test projects: `{ProjectName}.{Layer}.Tests`

### Lambda Parameters

Always use descriptive parameter names in lambda expressions:

```csharp
// ✅ Good
var activeUsers = users.Where(user => user.IsActive)
                      .Select(user => user.Email);

// ❌ Avoid
var activeUsers = users.Where(x => x.IsActive)
                      .Select(x => x.Email);
```

### Test Naming

- Test classes: `{ClassUnderTest}Fixture`
- Use NUnit 4 testing framework
- Always use `.Verifiable()` with Moq setups
- Verify all mocks after assertions

### File Organization

- One class per file
- No class and interface in the same file
- File name matches class name exactly

## Project Structure

### Standard Architecture

Follow Microsoft's recommended project structure:

- **Clean Architecture**:
  [Microsoft Learn - Clean Architecture](https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/common-web-application-architectures#clean-architecture)
- **Solution Structure**:
  [Microsoft Learn - Solution and Project Structure](https://learn.microsoft.com/en-us/dotnet/core/tutorials/top-level-templates)

### Elite Project Organization

```text
Solution.sln
├── src/
│   ├── {ProjectName}.Core/              # Domain models, enums, constants
│   ├── {ProjectName}.Data/              # Entity Framework, data access
│   ├── {ProjectName}.Services/          # Business logic services
│   ├── {ProjectName}.Api.Core/          # Shared API infrastructure
│   ├── {ProjectName}.Admin.Api/         # Administrative API
│   ├── {ProjectName}.Public.Api/        # Public/client-facing API
│   ├── {ProjectName}.Web.Core/          # Shared web infrastructure
│   ├── {ProjectName}.Web.Components/    # Reusable Blazor components
│   ├── {ProjectName}.Functions/         # Azure Functions
│   ├── {ProjectName}.ServiceDefaults/   # .NET Aspire service defaults
│   └── {ProjectName}.AppHost/           # .NET Aspire orchestration
├── tests/
│   ├── {ProjectName}.{Layer}.Tests/     # Individual test projects
│   └── {ProjectName}.Tests.Abstractions/ # Shared test utilities
├── .build/                             # Build configurations
└── .github/                            # GitHub workflows
```

### ServiceCollectionExtensions Pattern

Each project library must include a service registration extension using [Scrutor](https://github.com/khellang/Scrutor):

```csharp
public static class ServiceCollectionExtensions
{
    public static IServiceCollection Add{ProjectName}Services(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Use Scrutor for convention-based registration
        return services.Scan(types => types.FromAssemblyOf<SomeService>()
                                           .AddClasses()
                                           .AsMatchingInterface()
                                           .WithScopedLifetime());
    }
}
```

## Testing Standards

### Framework Standards

- **Testing Framework**: [NUnit 4](https://docs.nunit.org/)
- **Mocking**: [Moq](https://github.com/devlooped/moq) with `.Verifiable()` pattern
- **Component Testing**: [Bunit](https://bunit.dev/) for Blazor components
- **Assertions**: NUnit Assert with `Assert.Multiple()` for multiple assertions

### Official Testing Guidance

Follow Microsoft's testing best practices:

- **Unit Testing Best Practices**:
  [Microsoft Learn - Unit Testing Best Practices](https://learn.microsoft.com/en-us/dotnet/core/testing/unit-testing-best-practices)
- **Integration Testing**:
  [Microsoft Learn - Integration Testing](https://learn.microsoft.com/en-us/aspnet/core/test/integration-tests)

### Elite Testing Conventions

- Test classes: `{ClassUnderTest}Fixture`
- Integration tests: `[Category("Integration")]` and `[Explicit("Integration")]`
- Component tests inherit from `BunitFixture`
- Always verify mock setups: `_mockService.Verify()`

Example test structure:

```csharp
[TestFixture]
public class UserServiceFixture
{
    [SetUp]
    public void SetUp() { /* Setup mocks with .Verifiable() */ }

    [TearDown]
    public void TearDown() { /* Cleanup disposables */ }

    [Test]
    public async Task MethodName_Scenario_ExpectedResult()
    {
        // Arrange, Act, Assert
        // Verify mocks at end
    }
}
```

## API Design

Follow Microsoft's Web API guidance:

- **ASP.NET Core Web API**: [Microsoft Learn - Create Web APIs](https://learn.microsoft.com/en-us/aspnet/core/web-api/)
- **RESTful API Design**: [Microsoft REST API Guidelines](https://github.com/microsoft/api-guidelines) and
  [Microsoft Learn - REST API Design](https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design)

### Elite API Conventions

- Use `[ApiController]` attribute for all controllers
- Follow RESTful routing: `[Route("api/[controller]")]`
- Return `ActionResult<T>` for proper HTTP status codes
- Use proper HTTP verbs (GET, POST, PUT, PATCH, DELETE)

## Performance Guidelines

Follow Microsoft's performance best practices:

- **Performance Best Practices**:
  [Microsoft Learn - Performance Best Practices](https://learn.microsoft.com/en-us/aspnet/core/performance/performance-best-practices)
- **Async/Await**:
  [Microsoft Learn - Async Programming](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/async/)

### Elite Performance Standards

- Always use `async`/`await` for I/O operations
- Use `CancellationToken` parameters for async methods
- Use `ConfigureAwait(false)` in library code
- Prefer `StringBuilder` for string concatenation in loops

## Security Standards

Follow Microsoft's security guidance:

- **ASP.NET Core Security**:
  [Microsoft Learn - Security Overview](https://learn.microsoft.com/en-us/aspnet/core/security/)
- **Authentication & Authorization**:
  [Microsoft Learn - Auth Overview](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/)

### Elite Security Conventions

- Use [ASP.NET Core Identity](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity) for user
  management
- Implement [Entra External ID](https://learn.microsoft.com/en-us/entra/external-id/) as authentication provider
- Always validate input with model validation
- Use HTTPS in production environments

## Documentation Standards

Follow Microsoft's XML documentation guidelines:

- **XML Documentation**:
  [Microsoft Learn - XML Documentation](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/xmldoc/)

### Elite Documentation Requirements

- Document all public APIs with XML comments
- Include `<summary>`, `<param>`, `<returns>`, and `<exception>` tags
- Use clear, concise descriptions
- Document complex business logic with inline comments

## Tools and Configuration

### EditorConfig

See [.editorconfig](./tools/.editorconfig) for complete formatting rules.

### Code Analysis Standards

Follow Microsoft's code analysis guidance:

- **Code Analysis**:
  [Microsoft Learn - Code Analysis](https://learn.microsoft.com/en-us/dotnet/fundamentals/code-analysis/overview)
- **Nullable Reference Types**:
  [Microsoft Learn - Nullable Reference Types](https://learn.microsoft.com/en-us/dotnet/csharp/nullable-references)

### Elite Tool Requirements

- **Core Framework**: Elite.Data, Elite.Api.Client, Elite.Storage.\*
- **Testing**: [NUnit 4](https://docs.nunit.org/), [Moq](https://github.com/devlooped/moq), [Bunit](https://bunit.dev/),
  [MockQueryable](https://github.com/romantitov/MockQueryable)
- **Validation**: [FluentValidation](https://docs.fluentvalidation.net/) for complex validation scenarios
- **HTTP Clients**: [Refit](https://github.com/reactiveui/refit) with Elite.Api.Client.Logging
- **Blazor UI**: [Telerik Blazor](https://docs.telerik.com/blazor-ui/introduction) components
- **Configuration**: [Scrutor](https://github.com/khellang/Scrutor) for dependency injection scanning
- **Monitoring**: [.NET Aspire](https://learn.microsoft.com/en-us/dotnet/aspire/) for observability and orchestration

### Elite Project Configuration

```xml
<!-- Directory.Build.props -->
<Project>
  <PropertyGroup>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <GenerateDocumentationFile>True</GenerateDocumentationFile>
    <NoWarn>CS1591</NoWarn>
    <EnableNETAnalyzers>True</EnableNETAnalyzers>
    <EnforceCodeStyleInBuild>True</EnforceCodeStyleInBuild>
    <AnalysisLevel>latest-recommended</AnalysisLevel>
    <AccelerateBuildsInVisualStudio>true</AccelerateBuildsInVisualStudio>
  </PropertyGroup>
</Project>
```
