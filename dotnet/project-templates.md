# .NET Project Templates

This document provides project templates and starter configurations for common .NET project types at Elite Business
Solutions.

## Web API Project Template

### Project File (.csproj)

```xml
<Project Sdk="Microsoft.NET.Sdk.Web">

  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <GenerateDocumentationFile>true</GenerateDocumentationFile>
    <DocumentationFile>bin\$(Configuration)\$(TargetFramework)\$(AssemblyName).xml</DocumentationFile>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="AutoMapper" Version="12.0.1" />
    <PackageReference Include="AutoMapper.Extensions.Microsoft.DependencyInjection" Version="12.0.1" />
    <PackageReference Include="FluentValidation.AspNetCore" Version="11.3.0" />
    <PackageReference Include="Microsoft.AspNetCore.OpenApi" Version="8.0.0" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="8.0.0">
      <PrivateAssets>all</PrivateAssets>
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
    </PackageReference>
    <PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="8.0.0" />
    <PackageReference Include="Serilog.AspNetCore" Version="8.0.0" />
    <PackageReference Include="Serilog.Sinks.File" Version="5.0.0" />
    <PackageReference Include="Swashbuckle.AspNetCore" Version="6.4.0" />
  </ItemGroup>

  <ItemGroup>
    <ProjectReference Include="..\Elite.Core\Elite.Core.csproj" />
    <ProjectReference Include="..\Elite.Infrastructure\Elite.Infrastructure.csproj" />
  </ItemGroup>

</Project>
```

### appsettings.json

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=EliteDb;Trusted_Connection=true;MultipleActiveResultSets=true"
  },
  "Serilog": {
    "Using": ["Serilog.Sinks.Console", "Serilog.Sinks.File"],
    "MinimumLevel": {
      "Default": "Information",
      "Override": {
        "Microsoft": "Warning",
        "Microsoft.Hosting.Lifetime": "Information",
        "System": "Warning"
      }
    },
    "WriteTo": [
      {
        "Name": "Console",
        "Args": {
          "outputTemplate": "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj} {Properties:j}{NewLine}{Exception}"
        }
      },
      {
        "Name": "File",
        "Args": {
          "path": "logs/elite-api-.txt",
          "rollingInterval": "Day",
          "retainedFileCountLimit": 30,
          "outputTemplate": "[{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} {Level:u3}] {Message:lj} {Properties:j}{NewLine}{Exception}"
        }
      }
    ],
    "Enrich": ["FromLogContext", "WithMachineName", "WithThreadId"]
  },
  "AllowedHosts": "*",
  "Cors": {
    "AllowedOrigins": ["https://localhost:3000", "https://app.elite.com"]
  }
}
```

### appsettings.Development.json

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=EliteDb_Dev;Trusted_Connection=true;MultipleActiveResultSets=true"
  },
  "Serilog": {
    "MinimumLevel": {
      "Default": "Debug",
      "Override": {
        "Microsoft": "Information",
        "System": "Information"
      }
    }
  },
  "Cors": {
    "AllowedOrigins": [
      "https://localhost:3000",
      "http://localhost:3000",
      "https://localhost:5173",
      "http://localhost:5173"
    ]
  }
}
```

## Class Library Template

### Core Library Project File

```xml
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
    <GenerateDocumentationFile>true</GenerateDocumentationFile>
    <DocumentationFile>bin\$(Configuration)\$(TargetFramework)\$(AssemblyName).xml</DocumentationFile>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="FluentValidation" Version="11.8.0" />
    <PackageReference Include="Microsoft.Extensions.Logging.Abstractions" Version="8.0.0" />
    <PackageReference Include="System.ComponentModel.Annotations" Version="5.0.0" />
  </ItemGroup>

</Project>
```

### Infrastructure Library Project File

```xml
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
    <GenerateDocumentationFile>true</GenerateDocumentationFile>
    <DocumentationFile>bin\$(Configuration)\$(TargetFramework)\$(AssemblyName).xml</DocumentationFile>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.EntityFrameworkCore" Version="8.0.0" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="8.0.0" />
    <PackageReference Include="Microsoft.Extensions.Configuration.Abstractions" Version="8.0.0" />
    <PackageReference Include="Microsoft.Extensions.Logging.Abstractions" Version="8.0.0" />
  </ItemGroup>

  <ItemGroup>
    <ProjectReference Include="..\Elite.Core\Elite.Core.csproj" />
  </ItemGroup>

</Project>
```

## Console Application Template

### Project File

```xml
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.Extensions.Configuration" Version="8.0.0" />
    <PackageReference Include="Microsoft.Extensions.Configuration.Json" Version="8.0.0" />
    <PackageReference Include="Microsoft.Extensions.DependencyInjection" Version="8.0.0" />
    <PackageReference Include="Microsoft.Extensions.Hosting" Version="8.0.0" />
    <PackageReference Include="Serilog.Extensions.Hosting" Version="8.0.0" />
    <PackageReference Include="Serilog.Settings.Configuration" Version="8.0.0" />
    <PackageReference Include="Serilog.Sinks.Console" Version="5.0.0" />
    <PackageReference Include="Serilog.Sinks.File" Version="5.0.0" />
  </ItemGroup>

  <ItemGroup>
    <None Update="appsettings.json">
      <CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory>
    </None>
  </ItemGroup>

</Project>
```

### Program.cs for Console App

```csharp
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Serilog;

namespace Elite.Console
{
    internal class Program
    {
        private static async Task Main(string[] args)
        {
            var configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .AddEnvironmentVariables()
                .AddCommandLine(args)
                .Build();

            Log.Logger = new LoggerConfiguration()
                .ReadFrom.Configuration(configuration)
                .Enrich.FromLogContext()
                .CreateLogger();

            try
            {
                Log.Information("Starting Elite Console Application");

                var host = CreateHostBuilder(args, configuration).Build();

                var app = host.Services.GetRequiredService<Application>();
                await app.RunAsync();

                Log.Information("Elite Console Application completed successfully");
            }
            catch (Exception ex)
            {
                Log.Fatal(ex, "Elite Console Application terminated unexpectedly");
                throw;
            }
            finally
            {
                Log.CloseAndFlush();
            }
        }

        private static IHostBuilder CreateHostBuilder(string[] args, IConfiguration configuration) =>
            Host.CreateDefaultBuilder(args)
                .UseSerilog()
                .ConfigureServices((context, services) =>
                {
                    // Register your services here
                    services.AddSingleton<Application>();
                    services.AddScoped<IDataService, DataService>();
                });
    }

    public class Application
    {
        private readonly ILogger<Application> _logger;
        private readonly IDataService _dataService;

        public Application(ILogger<Application> logger, IDataService dataService)
        {
            _logger = logger;
            _dataService = dataService;
        }

        public async Task RunAsync()
        {
            _logger.LogInformation("Application started");

            // Your application logic here
            await _dataService.ProcessDataAsync();

            _logger.LogInformation("Application finished");
        }
    }
}
```

## Test Project Template

### Test Project File

```xml
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
    <IsPackable>false</IsPackable>
    <IsTestProject>true</IsTestProject>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="coverlet.collector" Version="6.0.0">
      <PrivateAssets>all</PrivateAssets>
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
    </PackageReference>
    <PackageReference Include="FluentAssertions" Version="6.12.0" />
    <PackageReference Include="Microsoft.AspNetCore.Mvc.Testing" Version="8.0.0" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.InMemory" Version="8.0.0" />
    <PackageReference Include="Microsoft.NET.Test.Sdk" Version="17.8.0" />
    <PackageReference Include="Moq" Version="4.20.69" />
    <PackageReference Include="xunit" Version="2.6.1" />
    <PackageReference Include="xunit.runner.visualstudio" Version="2.5.3">
      <PrivateAssets>all</PrivateAssets>
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
    </PackageReference>
  </ItemGroup>

  <ItemGroup>
    <ProjectReference Include="..\Elite.Core\Elite.Core.csproj" />
    <ProjectReference Include="..\Elite.Infrastructure\Elite.Infrastructure.csproj" />
    <ProjectReference Include="..\Elite.Api\Elite.Api.csproj" />
  </ItemGroup>

  <ItemGroup>
    <Using Include="Xunit" />
    <Using Include="FluentAssertions" />
    <Using Include="Moq" />
  </ItemGroup>

</Project>
```

### Test Base Class

```csharp
// Elite.Tests.Common/TestBase.cs
using Microsoft.Extensions.Logging;
using Moq;

namespace Elite.Tests.Common
{
    public abstract class TestBase
    {
        protected Mock<ILogger<T>> CreateMockLogger<T>()
        {
            return new Mock<ILogger<T>>();
        }

        protected void VerifyLoggerCalled<T>(Mock<ILogger<T>> mockLogger, LogLevel level, Times times)
        {
            mockLogger.Verify(
                x => x.Log(
                    level,
                    It.IsAny<EventId>(),
                    It.Is<It.IsAnyType>((v, t) => true),
                    It.IsAny<Exception>(),
                    It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
                times);
        }
    }
}
```

## Solution Structure Template

### Directory Structure

```text
Elite.Solution/
├── src/
│   ├── Elite.Core/                      # Domain layer
│   │   ├── Entities/
│   │   ├── Interfaces/
│   │   ├── Services/
│   │   ├── Exceptions/
│   │   └── Validators/
│   ├── Elite.Infrastructure/            # Infrastructure layer
│   │   ├── Data/
│   │   ├── Repositories/
│   │   ├── Services/
│   │   └── Configurations/
│   ├── Elite.Api/                       # API layer
│   │   ├── Controllers/
│   │   ├── Models/
│   │   ├── Mapping/
│   │   ├── Middleware/
│   │   └── Filters/
│   └── Elite.Web/                       # MVC Web layer (if needed)
│       ├── Controllers/
│       ├── Views/
│       ├── Models/
│       └── wwwroot/
├── tests/
│   ├── Elite.Core.Tests/
│   ├── Elite.Infrastructure.Tests/
│   ├── Elite.Api.Tests/
│   └── Elite.Tests.Common/
├── docs/
│   ├── api/
│   ├── architecture/
│   └── deployment/
├── tools/
│   ├── scripts/
│   └── docker/
├── .editorconfig
├── .gitignore
├── Directory.Build.props
├── Elite.Solution.sln
└── README.md
```

### Solution File Template

```xml
Microsoft Visual Studio Solution File, Format Version 12.00
# Visual Studio Version 17
VisualStudioVersion = 17.0.31903.59
MinimumVisualStudioVersion = 10.0.40219.1

Project("{2150E333-8FDC-42A3-9474-1A3956D46DE8}") = "src", "src", "{SRC-FOLDER-GUID}"
EndProject

Project("{2150E333-8FDC-42A3-9474-1A3956D46DE8}") = "tests", "tests", "{TESTS-FOLDER-GUID}"
EndProject

Project("{2150E333-8FDC-42A3-9474-1A3956D46DE8}") = "docs", "docs", "{DOCS-FOLDER-GUID}"
EndProject

Project("{9A19103F-16F7-4668-BE54-9A1E7A4F7556}") = "Elite.Core", "src\Elite.Core\Elite.Core.csproj", "{CORE-PROJECT-GUID}"
EndProject

Project("{9A19103F-16F7-4668-BE54-9A1E7A4F7556}") = "Elite.Infrastructure", "src\Elite.Infrastructure\Elite.Infrastructure.csproj", "{INFRASTRUCTURE-PROJECT-GUID}"
EndProject

Project("{9A19103F-16F7-4668-BE54-9A1E7A4F7556}") = "Elite.Api", "src\Elite.Api\Elite.Api.csproj", "{API-PROJECT-GUID}"
EndProject

Project("{9A19103F-16F7-4668-BE54-9A1E7A4F7556}") = "Elite.Core.Tests", "tests\Elite.Core.Tests\Elite.Core.Tests.csproj", "{CORE-TESTS-PROJECT-GUID}"
EndProject

Project("{9A19103F-16F7-4668-BE54-9A1E7A4F7556}") = "Elite.Infrastructure.Tests", "tests\Elite.Infrastructure.Tests\Elite.Infrastructure.Tests.csproj", "{INFRASTRUCTURE-TESTS-PROJECT-GUID}"
EndProject

Project("{9A19103F-16F7-4668-BE54-9A1E7A4F7556}") = "Elite.Api.Tests", "tests\Elite.Api.Tests\Elite.Api.Tests.csproj", "{API-TESTS-PROJECT-GUID}"
EndProject

Global
    GlobalSection(SolutionConfigurationPlatforms) = preSolution
        Debug|Any CPU = Debug|Any CPU
        Release|Any CPU = Release|Any CPU
    EndGlobalSection

    GlobalSection(ProjectConfigurationPlatforms) = postSolution
        {CORE-PROJECT-GUID}.Debug|Any CPU.ActiveCfg = Debug|Any CPU
        {CORE-PROJECT-GUID}.Debug|Any CPU.Build.0 = Debug|Any CPU
        {CORE-PROJECT-GUID}.Release|Any CPU.ActiveCfg = Release|Any CPU
        {CORE-PROJECT-GUID}.Release|Any CPU.Build.0 = Release|Any CPU

        {INFRASTRUCTURE-PROJECT-GUID}.Debug|Any CPU.ActiveCfg = Debug|Any CPU
        {INFRASTRUCTURE-PROJECT-GUID}.Debug|Any CPU.Build.0 = Debug|Any CPU
        {INFRASTRUCTURE-PROJECT-GUID}.Release|Any CPU.ActiveCfg = Release|Any CPU
        {INFRASTRUCTURE-PROJECT-GUID}.Release|Any CPU.Build.0 = Release|Any CPU

        {API-PROJECT-GUID}.Debug|Any CPU.ActiveCfg = Debug|Any CPU
        {API-PROJECT-GUID}.Debug|Any CPU.Build.0 = Debug|Any CPU
        {API-PROJECT-GUID}.Release|Any CPU.ActiveCfg = Release|Any CPU
        {API-PROJECT-GUID}.Release|Any CPU.Build.0 = Release|Any CPU

        {CORE-TESTS-PROJECT-GUID}.Debug|Any CPU.ActiveCfg = Debug|Any CPU
        {CORE-TESTS-PROJECT-GUID}.Debug|Any CPU.Build.0 = Debug|Any CPU
        {CORE-TESTS-PROJECT-GUID}.Release|Any CPU.ActiveCfg = Release|Any CPU
        {CORE-TESTS-PROJECT-GUID}.Release|Any CPU.Build.0 = Release|Any CPU

        {INFRASTRUCTURE-TESTS-PROJECT-GUID}.Debug|Any CPU.ActiveCfg = Debug|Any CPU
        {INFRASTRUCTURE-TESTS-PROJECT-GUID}.Debug|Any CPU.Build.0 = Debug|Any CPU
        {INFRASTRUCTURE-TESTS-PROJECT-GUID}.Release|Any CPU.ActiveCfg = Release|Any CPU
        {INFRASTRUCTURE-TESTS-PROJECT-GUID}.Release|Any CPU.Build.0 = Release|Any CPU

        {API-TESTS-PROJECT-GUID}.Debug|Any CPU.ActiveCfg = Debug|Any CPU
        {API-TESTS-PROJECT-GUID}.Debug|Any CPU.Build.0 = Debug|Any CPU
        {API-TESTS-PROJECT-GUID}.Release|Any CPU.ActiveCfg = Release|Any CPU
        {API-TESTS-PROJECT-GUID}.Release|Any CPU.Build.0 = Release|Any CPU
    EndGlobalSection

    GlobalSection(NestedProjects) = preSolution
        {CORE-PROJECT-GUID} = {SRC-FOLDER-GUID}
        {INFRASTRUCTURE-PROJECT-GUID} = {SRC-FOLDER-GUID}
        {API-PROJECT-GUID} = {SRC-FOLDER-GUID}
        {CORE-TESTS-PROJECT-GUID} = {TESTS-FOLDER-GUID}
        {INFRASTRUCTURE-TESTS-PROJECT-GUID} = {TESTS-FOLDER-GUID}
        {API-TESTS-PROJECT-GUID} = {TESTS-FOLDER-GUID}
    EndGlobalSection
EndGlobal
```

### PowerShell Script to Create Solution Structure

```powershell
# CreateEliteSolution.ps1
param(
    [Parameter(Mandatory=$true)]
    [string]$SolutionName,

    [Parameter(Mandatory=$false)]
    [string]$Path = "."
)

$solutionPath = Join-Path $Path $SolutionName

# Create solution structure
New-Item -ItemType Directory -Path $solutionPath -Force
Set-Location $solutionPath

# Create directories
@("src", "tests", "docs", "tools") | ForEach-Object {
    New-Item -ItemType Directory -Path $_ -Force
}

# Create solution
dotnet new sln -n $SolutionName

# Create projects
dotnet new classlib -n "$SolutionName.Core" -o "src\$SolutionName.Core"
dotnet new classlib -n "$SolutionName.Infrastructure" -o "src\$SolutionName.Infrastructure"
dotnet new webapi -n "$SolutionName.Api" -o "src\$SolutionName.Api"

# Create test projects
dotnet new xunit -n "$SolutionName.Core.Tests" -o "tests\$SolutionName.Core.Tests"
dotnet new xunit -n "$SolutionName.Infrastructure.Tests" -o "tests\$SolutionName.Infrastructure.Tests"
dotnet new xunit -n "$SolutionName.Api.Tests" -o "tests\$SolutionName.Api.Tests"

# Add projects to solution
dotnet sln add "src\$SolutionName.Core\$SolutionName.Core.csproj"
dotnet sln add "src\$SolutionName.Infrastructure\$SolutionName.Infrastructure.csproj"
dotnet sln add "src\$SolutionName.Api\$SolutionName.Api.csproj"
dotnet sln add "tests\$SolutionName.Core.Tests\$SolutionName.Core.Tests.csproj"
dotnet sln add "tests\$SolutionName.Infrastructure.Tests\$SolutionName.Infrastructure.Tests.csproj"
dotnet sln add "tests\$SolutionName.Api.Tests\$SolutionName.Api.Tests.csproj"

# Add project references
dotnet add "src\$SolutionName.Infrastructure\$SolutionName.Infrastructure.csproj" reference "src\$SolutionName.Core\$SolutionName.Core.csproj"
dotnet add "src\$SolutionName.Api\$SolutionName.Api.csproj" reference "src\$SolutionName.Core\$SolutionName.Core.csproj"
dotnet add "src\$SolutionName.Api\$SolutionName.Api.csproj" reference "src\$SolutionName.Infrastructure\$SolutionName.Infrastructure.csproj"

dotnet add "tests\$SolutionName.Core.Tests\$SolutionName.Core.Tests.csproj" reference "src\$SolutionName.Core\$SolutionName.Core.csproj"
dotnet add "tests\$SolutionName.Infrastructure.Tests\$SolutionName.Infrastructure.Tests.csproj" reference "src\$SolutionName.Infrastructure\$SolutionName.Infrastructure.csproj"
dotnet add "tests\$SolutionName.Api.Tests\$SolutionName.Api.Tests.csproj" reference "src\$SolutionName.Api\$SolutionName.Api.csproj"

Write-Host "Solution '$SolutionName' created successfully at '$solutionPath'" -ForegroundColor Green
```

---

Last updated: August 19, 2025
