# JavaScript/TypeScript Development Standards

## General Guidelines

### Language Versions

- **TypeScript**: [5.x latest](https://www.typescriptlang.org/)
- **Node.js**: [LTS version](https://nodejs.org/) (currently 18.x or 20.x)
- **React**: [18.x latest](https://react.dev/)

### Development Environment

- [Visual Studio Code](https://code.visualstudio.com/) with recommended extensions
- [ESLint](https://eslint.org/) and [Prettier](https://prettier.io/) for code formatting
- [TypeScript](https://www.typescriptlang.org/) for type safety

## TypeScript Standards

### Configuration

Use strict TypeScript configuration:

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"]
}
```

### Naming Conventions

- **Variables/Functions**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Types/Interfaces**: PascalCase
- **Components**: PascalCase

## React Standards

### Component Structure

```typescript
// ✅ Good - Functional component with TypeScript
interface CustomerCardProps {
  customer: Customer;
  onEdit: (customer: Customer) => void;
  onDelete: (id: number) => void;
}

export const CustomerCard: React.FC<CustomerCardProps> = ({
  customer,
  onEdit,
  onDelete
}) => {
  const handleEdit = useCallback(() => {
    onEdit(customer);
  }, [customer, onEdit]);

  return (
    <div className="customer-card">
      <h3>{customer.name}</h3>
      <p>{customer.email}</p>
      <button onClick={handleEdit}>Edit</button>
      <button onClick={() => onDelete(customer.id)}>Delete</button>
    </div>
  );
};
```

## Testing Standards

### Unit Testing with [Jest](https://jestjs.io/)

```typescript
// CustomerService.test.ts
import { CustomerService } from "./CustomerService"
import { mockCustomerRepository } from "../__mocks__/CustomerRepository"

describe("CustomerService", () => {
  let service: CustomerService

  beforeEach(() => {
    service = new CustomerService(mockCustomerRepository)
  })

  test("should get customer by id", async () => {
    // Arrange
    const customerId = 1
    const expectedCustomer = { id: 1, name: "John Doe", email: "john@example.com" }
    mockCustomerRepository.getById.mockResolvedValue(expectedCustomer)

    // Act
    const result = await service.getCustomer(customerId)

    // Assert
    expect(result).toEqual(expectedCustomer)
    expect(mockCustomerRepository.getById).toHaveBeenCalledWith(customerId)
  })
})
```

---

_This is a placeholder for JavaScript/TypeScript standards. Full documentation to be completed._
