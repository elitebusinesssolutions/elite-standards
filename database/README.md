# Database Development Standards

## General Guidelines

### Supported Database Systems

- **Primary**: [SQL Server 2019+](https://www.microsoft.com/en-us/sql-server/sql-server-2019)
- **Development**:
  [SQL Server LocalDB](https://learn.microsoft.com/en-us/sql/database-engine/configure-windows/sql-server-express-localdb)
- **Cloud**: [Azure SQL Database](https://azure.microsoft.com/en-us/products/azure-sql/database/)

### Naming Conventions

- **Tables**: PascalCase, singular (e.g., `Customer`, `OrderItem`)
- **Columns**: PascalCase (e.g., `CustomerId`, `FirstName`)
- **Indexes**: `IX_TableName_ColumnName`
- **Foreign Keys**: `FK_TableName_ReferencedTable`
- **Primary Keys**: `PK_TableName`

## SQL Server Standards

### Table Design

```sql
-- ✅ Good - Standard table structure
CREATE TABLE Customer (
    CustomerId INT IDENTITY(1,1) NOT NULL,
    FirstName NVARCHAR(50) NOT NULL,
    LastName NVARCHAR(50) NOT NULL,
    Email NVARCHAR(255) NOT NULL,
    PhoneNumber NVARCHAR(20) NULL,
    CreatedDate DATETIME2(7) NOT NULL DEFAULT GETUTCDATE(),
    LastModifiedDate DATETIME2(7) NULL,
    IsActive BIT NOT NULL DEFAULT 1,

    CONSTRAINT PK_Customer PRIMARY KEY (CustomerId),
    CONSTRAINT UQ_Customer_Email UNIQUE (Email),
    INDEX IX_Customer_Email (Email),
    INDEX IX_Customer_LastName (LastName)
);
```

### Stored Procedure Standards

```sql
-- ✅ Good - Stored procedure example
CREATE PROCEDURE [dbo].[GetCustomerById]
    @CustomerId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        CustomerId,
        FirstName,
        LastName,
        Email,
        PhoneNumber,
        CreatedDate,
        LastModifiedDate,
        IsActive
    FROM Customer
    WHERE CustomerId = @CustomerId
        AND IsActive = 1;
END
```

## [Entity Framework](https://learn.microsoft.com/en-us/ef/) Standards

### DbContext Configuration

```csharp
public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Customer> Customers { get; set; } = null!;
    public DbSet<Order> Orders { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
```

### Entity Configuration

```csharp
public class CustomerConfiguration : IEntityTypeConfiguration<Customer>
{
    public void Configure(EntityTypeBuilder<Customer> builder)
    {
        builder.ToTable("Customer");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Id)
            .HasColumnName("CustomerId")
            .ValueGeneratedOnAdd();

        builder.Property(e => e.FirstName)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(e => e.Email)
            .HasMaxLength(255)
            .IsRequired();

        builder.HasIndex(e => e.Email)
            .IsUnique()
            .HasDatabaseName("UQ_Customer_Email");
    }
}
```

---

_This is a placeholder for database standards. Full documentation to be completed._
