# .NET Code Examples

This document provides practical code examples that demonstrate the standards outlined in the main documentation.

## Service Layer with Elite.Data

### Service Implementation

```csharp
// ProjectName.Services/Data/UserService.cs
using Elite.Data;
using ProjectName.Data.Entities;

namespace ProjectName.Services.Data;

public class UserService : IUserService, IDisposable
{
    private readonly IRepository _repository;
    private readonly ILogger<UserService> _logger;

    public UserService(IRepository repository, ILogger<UserService> logger)
    {
        _repository = repository ?? throw new ArgumentNullException(nameof(repository));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<User?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        if (id <= 0)
        {
            throw new ArgumentException("User ID must be greater than zero", nameof(id));
        }

        try
        {
            _logger.LogDebug("Retrieving user with ID {UserId}", id);

            return await _repository.Query<User>()
                                   .FirstOrDefaultAsync(user => user.Id == id, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while retrieving user with ID {UserId}", id);
            throw;
        }
    }

    public async Task<bool> EmailExistsAsync(string loginProvider, string providerKey, string email, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            throw new ArgumentException("Email cannot be null or empty", nameof(email));
        }

        try
        {
            return await _repository.Query<User>()
                                   .Where(user => user.Email == email)
                                   .Where(user => !user.UserLogins.Any(login =>
                                       login.LoginProvider == loginProvider &&
                                       login.ProviderKey == providerKey))
                                   .AnyAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while checking email existence for {Email}", email);
            throw;
        }
    }

    public void Dispose()
    {
        // Cleanup if needed
        GC.SuppressFinalize(this);
    }
}
```

### Service Interface

```csharp
// ProjectName.Services/Data/IUserService.cs
using ProjectName.Data.Entities;

namespace ProjectName.Services.Data;

public interface IUserService
{
    Task<User?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<bool> EmailExistsAsync(string loginProvider, string providerKey, string email, CancellationToken cancellationToken = default);
    Task<bool> PublicAgreementAcceptedAsync(int userId, CancellationToken cancellationToken = default);
}
```

## ServiceCollectionExtensions Pattern

### Service Registration with Scrutor

```csharp
// ProjectName.Services/ServiceCollectionExtensions.cs
using Elite.Storage.AzureBlob;
using Elite.Storage.AzureQueues;
using Microsoft.Extensions.DependencyInjection;
using ProjectName.Services.Data;
using ProjectName.Services.Settings;

namespace ProjectName.Services;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddBusinessServices(
        this IServiceCollection services,
        StorageSettings storageSettings)
    {
        // Configuration objects
        services.AddSingleton(storageSettings);

        // External service configurations
        services.AddEliteAzureQueues(new QueueStorageSettings
        {
            ConnectionString = storageSettings.ConnectionString
        });

        services.AddEliteAzureBlob(new BlobStorageServiceSettings
        {
            ConnectionString = storageSettings.ConnectionString
        });

        // Convention-based service registration using Scrutor
        return services.Scan(types => types.FromAssemblyOf<UserService>()
                                           .AddClasses()
                                           .AsMatchingInterface()
                                           .WithScopedLifetime());
    }
}
```

### API Client Registration

```csharp
// ProjectName.Api.Clients/ServiceCollectionExtensions.cs
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Http.Logging;
using Microsoft.Extensions.Logging;
using Refit;

namespace ProjectName.Api.Clients;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApiClients(
        this IServiceCollection services,
        Uri baseAddress,
        Func<IServiceProvider, DelegatingHandler>? handlerFactory,
        Type clientAssemblyType)
    {
        // Add logging handler for HTTP requests
        services.AddScoped(provider => new LoggingHttpMessageHandler(
            provider.GetRequiredService<ILogger<LoggingHttpMessageHandler>>()));

        // Configure serialization options
        var serializerOptions = new SerializerOptions();
        services.AddSingleton(serializerOptions);

        var refitSettings = new RefitSettings(
            new SystemTextJsonContentSerializer(serializerOptions.Options));

        // Auto-discover and register Refitter generated clients
        var clientTypes = clientAssemblyType.Assembly.GetTypes()
                                            .Where(type => type.IsInterface &&
                                                         type.Name.EndsWith("Api", StringComparison.InvariantCulture))
                                            .ToArray();

        foreach (var clientType in clientTypes)
        {
            try
            {
                AddClient(services, clientType, baseAddress, handlerFactory, refitSettings);
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Failed to register client {clientType.Name}", ex);
            }
        }

        return services;
    }

    private static void AddClient(IServiceCollection services, Type clientType, Uri baseAddress,
                                  Func<IServiceProvider, DelegatingHandler>? handlerFactory,
                                  RefitSettings refitSettings)
    {
        var httpClientBuilder = services.AddRefitClient(clientType, refitSettings)
                                       .ConfigureHttpClient(client => client.BaseAddress = baseAddress);

        if (handlerFactory != null)
        {
            httpClientBuilder.AddHttpMessageHandler(handlerFactory);
        }
    }
}
```

## NUnit Testing Examples

### Service Test with Moq and MockQueryable

```csharp
// ProjectName.Services.Tests/Data/UserServiceFixture.cs
using Elite.Data;
using MockQueryable;
using Moq;
using ProjectName.Data.Entities;
using ProjectName.Services.Data;

namespace ProjectName.Services.Tests.Data;

[TestFixture]
public class UserServiceFixture
{
    private Mock<IRepository> _mockRepository = null!;
    private UserService _service = null!;
    private List<User> _users = null!;

    [SetUp]
    public void SetUp()
    {
        _mockRepository = new Mock<IRepository>();
        _users = new List<User>
        {
            new()
            {
                Id = 1,
                Email = "user1@example.com",
                UserLogins = new List<UserLogin>
                {
                    new() { LoginProvider = "providerA", ProviderKey = "key1" },
                    new() { LoginProvider = "providerB", ProviderKey = "key2" }
                }
            },
            new()
            {
                Id = 2,
                Email = "user2@example.com",
                UserLogins = new List<UserLogin>
                {
                    new() { LoginProvider = "providerA", ProviderKey = "key3" }
                }
            }
        };

        var queryable = _users.AsQueryable().BuildMock();
        _mockRepository.Setup(repository => repository.Query<User>())
                      .Returns(queryable)
                      .Verifiable();

        _service = new UserService(_mockRepository.Object, Mock.Of<ILogger<UserService>>());
    }

    [TearDown]
    public void TearDown()
    {
        _service.Dispose();
    }

    [Test]
    public async Task GetByIdAsync_ValidId_ReturnsUser()
    {
        // Arrange
        var userId = 1;
        var cancellationToken = CancellationToken.None;

        // Act
        var result = await _service.GetByIdAsync(userId, cancellationToken);

        // Assert
        Assert.Multiple(() =>
        {
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Id, Is.EqualTo(userId));
            Assert.That(result.Email, Is.EqualTo("user1@example.com"));
        });

        _mockRepository.Verify();
    }

    [Test]
    public async Task GetByIdAsync_InvalidId_ThrowsArgumentException()
    {
        // Arrange
        var invalidId = 0;
        var cancellationToken = CancellationToken.None;

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ArgumentException>(
            () => _service.GetByIdAsync(invalidId, cancellationToken));

        Assert.That(exception.ParamName, Is.EqualTo("id"));
        Assert.That(exception.Message, Does.Contain("must be greater than zero"));
    }

    [Test]
    public async Task EmailExistsAsync_ExcludesUserWithSameProviderKey_ReturnsFalse()
    {
        // Arrange
        var loginProvider = "providerA";
        var providerKey = "key1";
        var email = "user1@example.com";
        var cancellationToken = CancellationToken.None;

        // Act
        var result = await _service.EmailExistsAsync(loginProvider, providerKey, email, cancellationToken);

        // Assert
        Assert.Multiple(() =>
        {
            Assert.That(result, Is.False, "Should not find own email when providerKey is provided");
        });

        _mockRepository.Verify();
    }

    [Theory]
    [TestCase(null)]
    [TestCase("")]
    [TestCase("   ")]
    public void EmailExistsAsync_InvalidEmail_ThrowsArgumentException(string invalidEmail)
    {
        // Arrange
        var loginProvider = "provider";
        var providerKey = "key";
        var cancellationToken = CancellationToken.None;

        // Act & Assert
        var exception = Assert.ThrowsAsync<ArgumentException>(
            () => _service.EmailExistsAsync(loginProvider, providerKey, invalidEmail, cancellationToken));

        Assert.That(exception.Result.ParamName, Is.EqualTo("email"));
    }
}
```

### Integration Test Example

```csharp
// ProjectName.Identity.Tests/DefaultUserFixture.cs
using Elite.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using ProjectName.Core;
using ProjectName.Data;
using ProjectName.Data.Entities;

namespace ProjectName.Identity.Tests;

[TestFixture]
[Explicit("Integration")]
[Category("Integration")]
[Category("SkipWhenLiveUnitTesting")]
public class DefaultUserFixture
{
    private ServiceProvider _provider = null!;

    private sealed class TestCurrentUserService : DefaultCurrentUserService
    {
        public TestCurrentUserService()
            : base("test")
        {
        }
    }

    [SetUp]
    public void Setup()
    {
        var configuration = new ConfigurationBuilder()
                            .AddJsonFile(Path.Combine(TestContext.CurrentContext.TestDirectory, "appsettings.json"))
                            .AddUserSecrets<DefaultUserFixture>()
                            .Build();

        var services = new ServiceCollection();
        services.AddBusinessData<TestCurrentUserService>(configuration.GetConnectionString(nameof(ApplicationContext))!)
                .AddIdentityData();

        _provider = services.BuildServiceProvider();
    }

    [TearDown]
    public void TearDown()
    {
        _provider.Dispose();
    }

    [Test]
    public async Task CreateAsync()
    {
        // Arrange
        var userManager = _provider.GetRequiredService<UserManager<User>>();
        var user = new User
        {
            Email = "test@example.com",
            UserName = "test@example.com"
        };

        // Act
        var result = await userManager.CreateAsync(user);

        // Assert
        Assert.Multiple(() =>
        {
            Assert.That(result.Succeeded, Is.True);
            Assert.That(user.Id, Is.GreaterThan(0));
        });
    }
}
```

## Blazor Component Testing

### BunitFixture Base Class

```csharp
// ProjectName.Web.Tests.Abstractions/BunitFixture.cs
using Bunit;
using Bunit.TestDoubles;
using Microsoft.AspNetCore.Components;
using NUnit.Framework;
using Telerik.Blazor.Components;

namespace ProjectName.Web.Tests.Abstractions;

/// <summary>
/// Base fixture for Bunit component tests.
/// </summary>
public abstract class BunitFixture : TestContextWrapper
{
    protected TestAuthorizationContext AuthorizationContext { get; set; } = default!;

    [SetUp]
    public virtual void Setup()
    {
        TestContext = new Bunit.TestContext();

        // Telerik components require TelerikRootComponent
        RenderTree.Add<TelerikRootComponent>();

        // Configure JSInterop for Telerik components
        JSInterop.SetupVoid("TelerikBlazor.initComponentLoaderContainer", _ => true);
        JSInterop.SetupVoid("TelerikBlazor.initColumnResizable", _ => true);
        JSInterop.SetupVoid("TelerikBlazor.columnResizableAutoFitAllColumns", _ => true);
        JSInterop.SetupVoid("TelerikBlazor.setOptions", _ => true);
        JSInterop.SetupVoid("TelerikBlazor.initDatePicker", _ => true);
        JSInterop.SetupVoid("TelerikBlazor.initCheckBox", _ => true);
        JSInterop.SetupVoid("TelerikBlazor.invokeComponentMethod", _ => true);
        JSInterop.SetupVoid("TelerikBlazor.initFilterMenu", _ => true);
        JSInterop.SetupVoid("TelerikBlazor.initTooltip", _ => true);
        JSInterop.SetupVoid("TelerikBlazor.initBreadcrumb", _ => true);
        JSInterop.SetupVoid("TelerikBlazor.initTabStrip", _ => true);
        JSInterop.SetupVoid("TelerikBlazor.initTreeView", _ => true);
        JSInterop.SetupVoid("TelerikBlazor.columnResizableSetColumns", _ => true);
        JSInterop.SetupVoid("TelerikBlazor.initListView", _ => true);
        JSInterop.SetupVoid("TelerikBlazor.initChip", _ => true);

        // App.razor testing
        JSInterop.Setup<string>("Blazor._internal.PageTitle.getAndRemoveExistingTitle");

        // Configure fake authorization
        AuthorizationContext = TestContext.AddTestAuthorization();
    }

    [TearDown]
    public void TearDown()
    {
        TestContext?.Dispose();
    }
}
```

### Component Test Example

```csharp
// ProjectName.Web.Components.Tests/FilteredGridFixture.cs
using Elite.Web.Contracts.Models;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using Refit;
using Telerik.Blazor.Components;
using Telerik.DataSource;
using ProjectName.Api.Clients;
using ProjectName.Web.Core.Store;
using ProjectName.Web.Tests.Abstractions;

namespace ProjectName.Web.Components.Tests;

[TestFixture]
public class FilteredGridFixture : BunitFixture
{
    private Mock<IGridClient<TestItemModel, TestFilterModel>> _mockGridClient = null!;
    private Mock<IAppStateService> _mockAppStateService = null!;

    public class TestItemModel : IModel
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }

    public class TestFilterModel
    {
        public string SearchTerm { get; set; } = string.Empty;
    }

    [SetUp]
    public override void Setup()
    {
        base.Setup();

        _mockGridClient = new Mock<IGridClient<TestItemModel, TestFilterModel>>();
        _mockAppStateService = new Mock<IAppStateService>();

        Services.AddSingleton(_mockGridClient.Object);
        Services.AddSingleton(_mockAppStateService.Object);
        Services.AddSingleton(new AppState());
        Services.AddSingleton(new GridSettings());
    }

    [Test]
    public async Task ReadAsync_CallsGridClient_ReturnsData()
    {
        // Arrange
        var expectedData = new PagedListModel<TestItemModel>
        {
            Items = new List<TestItemModel>
            {
                new() { Id = 1, Name = "Test Item 1" },
                new() { Id = 2, Name = "Test Item 2" }
            },
            TotalCount = 2
        };

        _mockGridClient.Setup(client => client.PostAsync(It.IsAny<DataSourceRequest>(), It.IsAny<CancellationToken>()))
                      .ReturnsAsync(expectedData)
                      .Verifiable();

        // Act
        var component = RenderComponent<FilteredGrid<TestItemModel, TestFilterModel>>(parameters => parameters
            .Add(p => p.GridName, "TestGrid")
            .Add(p => p.Filter, new TestFilterModel()));

        // Wait for component to load data
        await Task.Delay(100);

        // Assert
        Assert.Multiple(() =>
        {
            Assert.That(component.Find(".k-grid"), Is.Not.Null);
            var rows = component.FindAll(".k-table-row");
            Assert.That(rows.Count, Is.EqualTo(2));
        });

        _mockGridClient.Verify();
    }

    [Test]
    public async Task DeleteAsync_CallsServiceAndAppStateMethods()
    {
        // Arrange
        var itemToDelete = new TestItemModel { Id = 1, Name = "Test Item" };

        _mockGridClient.Setup(client => client.DeleteAsync(itemToDelete.Id, It.IsAny<CancellationToken>()))
                      .Returns(Task.CompletedTask)
                      .Verifiable();

        _mockAppStateService.Setup(service => service.ShowSuccessToast(It.IsAny<string>()))
                           .Verifiable();

        // Act
        var component = RenderComponent<FilteredGrid<TestItemModel, TestFilterModel>>();
        await component.InvokeAsync(() => component.Instance.DeleteAsync(itemToDelete));

        // Assert
        _mockGridClient.Verify();
        _mockAppStateService.Verify();
    }
}
```

## Configuration Examples

### .NET Aspire Service Defaults

```csharp
// ProjectName.ServiceDefaults/Extensions.cs
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.ServiceDiscovery;
using OpenTelemetry;
using OpenTelemetry.Metrics;
using OpenTelemetry.Trace;

namespace Microsoft.Extensions.Hosting;

public static class Extensions
{
    public static TBuilder AddServiceDefaults<TBuilder>(this TBuilder builder)
        where TBuilder : IHostApplicationBuilder
    {
        builder.ConfigureOpenTelemetry();
        builder.AddDefaultHealthChecks();

        builder.Services.AddServiceDiscovery();

        builder.Services.ConfigureHttpClientDefaults(http =>
        {
            // Turn on resilience by default
            http.AddStandardResilienceHandler();

            // Turn on service discovery by default
            http.AddServiceDiscovery();
        });

        return builder;
    }

    public static TBuilder ConfigureOpenTelemetry<TBuilder>(this TBuilder builder)
        where TBuilder : IHostApplicationBuilder
    {
        builder.Logging.AddOpenTelemetry(logging =>
        {
            logging.IncludeFormattedMessage = true;
            logging.IncludeScopes = true;
        });

        builder.Services.AddOpenTelemetry()
               .WithMetrics(metrics =>
               {
                   metrics.AddAspNetCoreInstrumentation()
                          .AddHttpClientInstrumentation()
                          .AddRuntimeInstrumentation();
               })
               .WithTracing(tracing =>
               {
                   tracing.AddAspNetCoreInstrumentation()
                          .AddHttpClientInstrumentation();
               });

        builder.AddOpenTelemetryExporters();

        return builder;
    }

    public static WebApplication MapDefaultEndpoints(this WebApplication app)
    {
        // Adding health checks endpoints to applications in non-development environments has security implications.
        if (app.Environment.IsDevelopment())
        {
            app.MapHealthChecks("/health");
            app.MapHealthChecks("/alive", new HealthCheckOptions
            {
                Predicate = _ => false
            });
        }

        return app;
    }
}
```

---

Last updated: August 19, 2025

## API Controller Example

```csharp
// Elite.Api/Controllers/CustomersController.cs
using Elite.Api.Models;
using Elite.Core.Entities;
using Elite.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;
using AutoMapper;

namespace Elite.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class CustomersController : ControllerBase
    {
        private readonly ICustomerService _customerService;
        private readonly IMapper _mapper;
        private readonly ILogger<CustomersController> _logger;

        public CustomersController(
            ICustomerService customerService,
            IMapper mapper,
            ILogger<CustomersController> logger)
        {
            _customerService = customerService ?? throw new ArgumentNullException(nameof(customerService));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Gets all active customers.
        /// </summary>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>A list of active customers.</returns>
        [HttpGet]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<CustomerDto>>), StatusCodes.Status200OK)]
        public async Task<ActionResult<ApiResponse<IEnumerable<CustomerDto>>>> GetCustomers(
            CancellationToken cancellationToken = default)
        {
            try
            {
                var customers = await _customerService.GetActiveCustomersAsync(cancellationToken);
                var customerDtos = _mapper.Map<IEnumerable<CustomerDto>>(customers);

                return Ok(new ApiResponse<IEnumerable<CustomerDto>>
                {
                    Success = true,
                    Data = customerDtos,
                    Message = "Customers retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving customers");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new ApiResponse<IEnumerable<CustomerDto>>
                    {
                        Success = false,
                        Message = "An error occurred while retrieving customers"
                    });
            }
        }

        /// <summary>
        /// Gets a customer by ID.
        /// </summary>
        /// <param name="id">The customer ID.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The customer if found.</returns>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<CustomerDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<CustomerDto>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<CustomerDto>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<CustomerDto>>> GetCustomer(
            int id,
            CancellationToken cancellationToken = default)
        {
            if (id <= 0)
            {
                return BadRequest(new ApiResponse<CustomerDto>
                {
                    Success = false,
                    Message = "Customer ID must be greater than zero"
                });
            }

            try
            {
                var customer = await _customerService.GetCustomerAsync(id, cancellationToken);

                if (customer == null)
                {
                    return NotFound(new ApiResponse<CustomerDto>
                    {
                        Success = false,
                        Message = $"Customer with ID {id} not found"
                    });
                }

                var customerDto = _mapper.Map<CustomerDto>(customer);

                return Ok(new ApiResponse<CustomerDto>
                {
                    Success = true,
                    Data = customerDto,
                    Message = "Customer retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving customer with ID {CustomerId}", id);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new ApiResponse<CustomerDto>
                    {
                        Success = false,
                        Message = "An error occurred while retrieving the customer"
                    });
            }
        }

        /// <summary>
        /// Creates a new customer.
        /// </summary>
        /// <param name="createDto">The customer creation data.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The created customer.</returns>
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<CustomerDto>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<CustomerDto>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<CustomerDto>>> CreateCustomer(
            [FromBody] CreateCustomerDto createDto,
            CancellationToken cancellationToken = default)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage);

                return BadRequest(new ApiResponse<CustomerDto>
                {
                    Success = false,
                    Message = "Validation failed",
                    Errors = errors
                });
            }

            try
            {
                var customer = _mapper.Map<Customer>(createDto);
                customer.CreatedDate = DateTime.UtcNow;

                var createdCustomer = await _customerService.CreateCustomerAsync(customer, cancellationToken);
                var customerDto = _mapper.Map<CustomerDto>(createdCustomer);

                return CreatedAtAction(
                    nameof(GetCustomer),
                    new { id = createdCustomer.Id },
                    new ApiResponse<CustomerDto>
                    {
                        Success = true,
                        Data = customerDto,
                        Message = "Customer created successfully"
                    });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while creating customer");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new ApiResponse<CustomerDto>
                    {
                        Success = false,
                        Message = "An error occurred while creating the customer"
                    });
            }
        }
    }
}
```

## Service Layer Example

```csharp
// Elite.Core/Services/CustomerService.cs
using Elite.Core.Entities;
using Elite.Core.Interfaces;
using Microsoft.Extensions.Logging;

namespace Elite.Core.Services
{
    public class CustomerService : ICustomerService
    {
        private readonly ICustomerRepository _repository;
        private readonly ILogger<CustomerService> _logger;

        public CustomerService(
            ICustomerRepository repository,
            ILogger<CustomerService> logger)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<Customer?> GetCustomerAsync(int id, CancellationToken cancellationToken = default)
        {
            if (id <= 0)
            {
                throw new ArgumentException("Customer ID must be greater than zero", nameof(id));
            }

            try
            {
                _logger.LogDebug("Retrieving customer with ID {CustomerId}", id);
                return await _repository.GetByIdAsync(id, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving customer with ID {CustomerId}", id);
                throw;
            }
        }

        public async Task<IEnumerable<Customer>> GetActiveCustomersAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Retrieving all active customers");
                return await _repository.GetActiveCustomersAsync(cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving active customers");
                throw;
            }
        }

        public async Task<Customer> CreateCustomerAsync(Customer customer, CancellationToken cancellationToken = default)
        {
            if (customer == null)
            {
                throw new ArgumentNullException(nameof(customer));
            }

            ValidateCustomer(customer);

            try
            {
                _logger.LogDebug("Creating new customer with email {Email}", customer.Email);

                // Check if customer with email already exists
                var existingCustomer = await _repository.GetByEmailAsync(customer.Email, cancellationToken);
                if (existingCustomer != null)
                {
                    throw new InvalidOperationException($"Customer with email {customer.Email} already exists");
                }

                customer.CreatedDate = DateTime.UtcNow;
                customer.IsActive = true;

                var createdCustomer = await _repository.AddAsync(customer, cancellationToken);

                _logger.LogInformation("Successfully created customer with ID {CustomerId}", createdCustomer.Id);
                return createdCustomer;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while creating customer");
                throw;
            }
        }

        public async Task<Customer> UpdateCustomerAsync(Customer customer, CancellationToken cancellationToken = default)
        {
            if (customer == null)
            {
                throw new ArgumentNullException(nameof(customer));
            }

            ValidateCustomer(customer);

            if (customer.Id <= 0)
            {
                throw new ArgumentException("Customer ID must be greater than zero", nameof(customer));
            }

            try
            {
                _logger.LogDebug("Updating customer with ID {CustomerId}", customer.Id);

                var existingCustomer = await _repository.GetByIdAsync(customer.Id, cancellationToken);
                if (existingCustomer == null)
                {
                    throw new InvalidOperationException($"Customer with ID {customer.Id} not found");
                }

                customer.LastModifiedDate = DateTime.UtcNow;
                customer.CreatedDate = existingCustomer.CreatedDate; // Preserve original creation date

                await _repository.UpdateAsync(customer, cancellationToken);

                _logger.LogInformation("Successfully updated customer with ID {CustomerId}", customer.Id);
                return customer;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating customer with ID {CustomerId}", customer.Id);
                throw;
            }
        }

        public async Task<bool> DeactivateCustomerAsync(int id, CancellationToken cancellationToken = default)
        {
            if (id <= 0)
            {
                throw new ArgumentException("Customer ID must be greater than zero", nameof(id));
            }

            try
            {
                _logger.LogDebug("Deactivating customer with ID {CustomerId}", id);

                var customer = await _repository.GetByIdAsync(id, cancellationToken);
                if (customer == null)
                {
                    return false;
                }

                customer.IsActive = false;
                customer.LastModifiedDate = DateTime.UtcNow;

                await _repository.UpdateAsync(customer, cancellationToken);

                _logger.LogInformation("Successfully deactivated customer with ID {CustomerId}", id);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while deactivating customer with ID {CustomerId}", id);
                throw;
            }
        }

        public async Task<bool> CustomerExistsAsync(int id, CancellationToken cancellationToken = default)
        {
            if (id <= 0)
            {
                return false;
            }

            try
            {
                var customer = await _repository.GetByIdAsync(id, cancellationToken);
                return customer != null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while checking if customer with ID {CustomerId} exists", id);
                throw;
            }
        }

        private static void ValidateCustomer(Customer customer)
        {
            if (string.IsNullOrWhiteSpace(customer.Name))
            {
                throw new ArgumentException("Customer name is required", nameof(customer));
            }

            if (string.IsNullOrWhiteSpace(customer.Email))
            {
                throw new ArgumentException("Customer email is required", nameof(customer));
            }

            if (customer.Name.Length > 100)
            {
                throw new ArgumentException("Customer name cannot exceed 100 characters", nameof(customer));
            }

            if (customer.Email.Length > 255)
            {
                throw new ArgumentException("Customer email cannot exceed 255 characters", nameof(customer));
            }
        }
    }
}
```

## Repository Pattern Example

```csharp
// Elite.Infrastructure/Repositories/CustomerRepository.cs
using Elite.Core.Entities;
using Elite.Core.Interfaces;
using Elite.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Elite.Infrastructure.Repositories
{
    public class CustomerRepository : ICustomerRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<CustomerRepository> _logger;

        public CustomerRepository(
            ApplicationDbContext context,
            ILogger<CustomerRepository> logger)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<Customer?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            try
            {
                return await _context.Customers
                    .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving customer with ID {CustomerId}", id);
                throw;
            }
        }

        public async Task<Customer?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
        {
            try
            {
                return await _context.Customers
                    .FirstOrDefaultAsync(c => c.Email == email, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving customer with email {Email}", email);
                throw;
            }
        }

        public async Task<IEnumerable<Customer>> GetActiveCustomersAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                return await _context.Customers
                    .Where(c => c.IsActive)
                    .OrderBy(c => c.Name)
                    .ToListAsync(cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving active customers");
                throw;
            }
        }

        public async Task<Customer> AddAsync(Customer customer, CancellationToken cancellationToken = default)
        {
            try
            {
                _context.Customers.Add(customer);
                await _context.SaveChangesAsync(cancellationToken);
                return customer;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while adding customer");
                throw;
            }
        }

        public async Task UpdateAsync(Customer customer, CancellationToken cancellationToken = default)
        {
            try
            {
                _context.Entry(customer).State = EntityState.Modified;
                await _context.SaveChangesAsync(cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating customer with ID {CustomerId}", customer.Id);
                throw;
            }
        }

        public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            try
            {
                var customer = await GetByIdAsync(id, cancellationToken);
                if (customer != null)
                {
                    _context.Customers.Remove(customer);
                    await _context.SaveChangesAsync(cancellationToken);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while deleting customer with ID {CustomerId}", id);
                throw;
            }
        }
    }
}
```

## Unit Testing Examples

```csharp
// Elite.Core.Tests/Services/CustomerServiceTests.cs
using Elite.Core.Entities;
using Elite.Core.Interfaces;
using Elite.Core.Services;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using FluentAssertions;

namespace Elite.Core.Tests.Services
{
    public class CustomerServiceTests
    {
        private readonly Mock<ICustomerRepository> _mockRepository;
        private readonly Mock<ILogger<CustomerService>> _mockLogger;
        private readonly CustomerService _customerService;

        public CustomerServiceTests()
        {
            _mockRepository = new Mock<ICustomerRepository>();
            _mockLogger = new Mock<ILogger<CustomerService>>();
            _customerService = new CustomerService(_mockRepository.Object, _mockLogger.Object);
        }

        [Fact]
        public async Task GetCustomerAsync_ValidId_ReturnsCustomer()
        {
            // Arrange
            var customerId = 1;
            var expectedCustomer = new Customer
            {
                Id = customerId,
                Name = "John Doe",
                Email = "john@example.com",
                IsActive = true
            };

            _mockRepository.Setup(x => x.GetByIdAsync(customerId, It.IsAny<CancellationToken>()))
                          .ReturnsAsync(expectedCustomer);

            // Act
            var result = await _customerService.GetCustomerAsync(customerId);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeEquivalentTo(expectedCustomer);
            _mockRepository.Verify(x => x.GetByIdAsync(customerId, It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task GetCustomerAsync_InvalidId_ThrowsArgumentException()
        {
            // Arrange
            var invalidId = 0;

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(() => _customerService.GetCustomerAsync(invalidId));
            _mockRepository.Verify(x => x.GetByIdAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()), Times.Never);
        }

        [Fact]
        public async Task CreateCustomerAsync_ValidCustomer_ReturnsCreatedCustomer()
        {
            // Arrange
            var customer = new Customer
            {
                Name = "Jane Doe",
                Email = "jane@example.com"
            };

            var createdCustomer = new Customer
            {
                Id = 1,
                Name = customer.Name,
                Email = customer.Email,
                CreatedDate = DateTime.UtcNow,
                IsActive = true
            };

            _mockRepository.Setup(x => x.GetByEmailAsync(customer.Email, It.IsAny<CancellationToken>()))
                          .ReturnsAsync((Customer?)null);

            _mockRepository.Setup(x => x.AddAsync(It.IsAny<Customer>(), It.IsAny<CancellationToken>()))
                          .ReturnsAsync(createdCustomer);

            // Act
            var result = await _customerService.CreateCustomerAsync(customer);

            // Assert
            result.Should().NotBeNull();
            result.Id.Should().Be(createdCustomer.Id);
            result.Name.Should().Be(customer.Name);
            result.Email.Should().Be(customer.Email);
            result.IsActive.Should().BeTrue();
            result.CreatedDate.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));

            _mockRepository.Verify(x => x.GetByEmailAsync(customer.Email, It.IsAny<CancellationToken>()), Times.Once);
            _mockRepository.Verify(x => x.AddAsync(It.IsAny<Customer>(), It.IsAny<CancellationToken>()), Times.Once);
        }

        [Theory]
        [InlineData(null)]
        [InlineData("")]
        [InlineData("   ")]
        public async Task CreateCustomerAsync_InvalidName_ThrowsArgumentException(string invalidName)
        {
            // Arrange
            var customer = new Customer
            {
                Name = invalidName,
                Email = "test@example.com"
            };

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(() => _customerService.CreateCustomerAsync(customer));
            _mockRepository.Verify(x => x.AddAsync(It.IsAny<Customer>(), It.IsAny<CancellationToken>()), Times.Never);
        }

        [Fact]
        public async Task CreateCustomerAsync_DuplicateEmail_ThrowsInvalidOperationException()
        {
            // Arrange
            var customer = new Customer
            {
                Name = "John Doe",
                Email = "john@example.com"
            };

            var existingCustomer = new Customer
            {
                Id = 1,
                Name = "Existing Customer",
                Email = customer.Email
            };

            _mockRepository.Setup(x => x.GetByEmailAsync(customer.Email, It.IsAny<CancellationToken>()))
                          .ReturnsAsync(existingCustomer);

            // Act & Assert
            var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _customerService.CreateCustomerAsync(customer));
            exception.Message.Should().Contain("already exists");

            _mockRepository.Verify(x => x.GetByEmailAsync(customer.Email, It.IsAny<CancellationToken>()), Times.Once);
            _mockRepository.Verify(x => x.AddAsync(It.IsAny<Customer>(), It.IsAny<CancellationToken>()), Times.Never);
        }
    }
}
```

## API Configuration Examples

### Program.cs (Minimal API / Web API)

```csharp
// Elite.Api/Program.cs
using Elite.Core.Interfaces;
using Elite.Core.Services;
using Elite.Infrastructure.Data;
using Elite.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("logs/elite-api-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// AutoMapper
builder.Services.AddAutoMapper(typeof(Program));

// Application Services
builder.Services.AddScoped<ICustomerService, CustomerService>();
builder.Services.AddScoped<ICustomerRepository, CustomerRepository>();

// CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("https://localhost:3000", "https://app.elite.com")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors();
app.UseAuthorization();
app.MapControllers();

// Ensure database is created
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    dbContext.Database.EnsureCreated();
}

try
{
    Log.Information("Starting Elite API");
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Elite API terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
```

### AutoMapper Profile

```csharp
// Elite.Api/Mapping/CustomerProfile.cs
using AutoMapper;
using Elite.Api.Models;
using Elite.Core.Entities;

namespace Elite.Api.Mapping
{
    public class CustomerProfile : Profile
    {
        public CustomerProfile()
        {
            CreateMap<Customer, CustomerDto>();
            CreateMap<CreateCustomerDto, Customer>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedDate, opt => opt.Ignore())
                .ForMember(dest => dest.LastModifiedDate, opt => opt.Ignore())
                .ForMember(dest => dest.IsActive, opt => opt.Ignore());
        }
    }
}
```

---

Last updated: August 19, 2025
