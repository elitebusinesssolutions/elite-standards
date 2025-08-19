# Elite Business Solutions - Development Standards

This repository contains development standards and best practices for Elite Business Solutions.

## Standards Documentation

- [.NET Standards](./dotnet/README.md)
- [JavaScript/TypeScript Standards](./javascript/README.md)
- [Database Standards](./database/README.md)
- [General Guidelines](./general/README.md)

## Purpose

These standards ensure consistency, maintainability, and quality across all development projects at Elite Business
Solutions.

## How to Use

Each technology section contains:

- Coding conventions
- Architecture guidelines
- Best practices
- Code examples
- Tools and configurations

## Development Environment

### VS Code Extensions

This repository includes recommended VS Code extensions for optimal development experience:

- **Markdown Linting**:
  [markdownlint](https://marketplace.visualstudio.com/items?itemName=DavidAnson.vscode-markdownlint)
- **Code Formatting**: [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- **Editor Configuration**:
  [EditorConfig](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig)
- **Markdown Editing**:
  [Markdown All in One](https://marketplace.visualstudio.com/items?itemName=yzhang.markdown-all-in-one)
- See [.vscode/extensions.json](./.vscode/extensions.json) for complete list

### Configuration Files

Our tooling follows a clear separation of concerns:

- **Basic Editor Settings**: [.editorconfig](./.editorconfig) - indentation, line endings, charset
- **Formatting Rules**: [package.json](./package.json) - Prettier configuration for style consistency
- **Content Structure**: [.markdownlint.json](./.markdownlint.json) - markdown best practices and validation
- **VS Code Settings**: [.vscode/settings.json](./.vscode/settings.json) - editor integration

### Linting Commands

```bash
# Lint all markdown files for content and structure
npm run lint:md

# Auto-fix markdown issues
npm run lint:md:fix

# Format markdown with Prettier
npm run format:md

# Check if files are properly formatted
npm run format:check

# Run all linting and formatting checks
npm run lint

# Auto-fix and format everything
npm run format
```

## Contributing

When updating standards, please:

1. Create a feature branch
2. Make your changes
3. Get peer review
4. Update relevant documentation
5. Merge to main

## Last Updated

August 19, 2025
