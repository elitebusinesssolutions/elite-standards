# Copilot Instructions for Elite Standards Repository

## 📚 Repository Context

This repository contains development standards and best practices for Elite Business Solutions. When working with this
repository, prioritize consistency, maintainability, and adherence to established patterns.

## 🔧 Tooling and Configuration

### Development Environment Setup

This repository uses a layered tooling approach with clear separation of concerns. For complete setup details, see the
main [Development Environment](../README.md#development-environment) documentation.

Key principles:

- **EditorConfig** (`.editorconfig`): Basic editor settings (indentation, line endings, charset)
- **Prettier**: Code formatting and style consistency (line wrapping, spacing)
- **markdownlint**: Content structure and markdown best practices

### Available Commands

For the complete list of available commands, see [Linting Commands](../README.md#linting-commands) in the main README.

Essential commands when making changes:

```bash
# Auto-fix formatting and linting issues
npm run format

# Check for any remaining issues
npm run lint
```

## 📝 Documentation Standards

### Content Guidelines

1. **Reference External Documentation**: Instead of writing detailed explanations, link to official sources:
   - Microsoft Learn for .NET topics
   - MDN for web technologies
   - Official tool documentation

2. **Avoid Manual TOCs**: GitHub automatically generates table of contents from headings

3. **Consistent Structure**: Follow the established pattern across all documentation files

4. **No Emphasis as Headings**: Use proper heading levels (`##`, `###`) instead of emphasized text (`*text*`)

### File Organization

```
/
├── dotnet/           # .NET specific standards
├── javascript/       # JavaScript/TypeScript standards
├── database/         # Database development standards
├── general/          # General development guidelines
└── .github/          # Repository configuration
```

### Link Strategy

- **External links**: Always include full URLs to official documentation
- **Internal links**: Use relative paths for cross-references within the repository
- **Link validation**: Ensure all internal links point to existing sections

## 🎯 When Making Changes

### Before Editing

1. Check current file contents with `read_file` to understand existing structure
2. Run `npm run lint:md` to see current issues
3. Understand the context of the change within the broader documentation

### During Editing

1. **Follow established patterns**: Look at existing files for consistency
2. **Reference over duplication**: Link to authoritative sources rather than recreating content
3. **Maintain tool separation**: Don't duplicate settings across configuration files
4. **Use proper markdown**: Follow markdownlint rules for structure and readability

### After Editing

1. **Auto-format**: Run `npm run format` to apply consistent formatting
2. **Verify**: Run `npm run lint` to check for any remaining issues
3. **Test links**: Ensure all internal references work correctly

## 🚀 Development Workflow

### Making Documentation Changes

For the standard workflow, see [Contributing](../README.md#contributing) in the main README.

Additional considerations for this repository:

1. Run `npm run format` to ensure proper formatting
2. Follow the established patterns in existing files
3. Use reference-based documentation approach
4. Test that all links work correctly

### Adding New Standards

1. **Research first**: Check if official guidance already exists
2. **Reference approach**: Link to authoritative sources
3. **Elite-specific only**: Only document conventions unique to Elite Business Solutions
4. **Consistency**: Follow the same structure as existing documentation

## 🎨 Code Examples and Templates

### When Providing Examples

- **Real-world focused**: Use practical examples that developers will actually encounter
- **Elite conventions**: Highlight Elite-specific patterns (ServiceCollectionExtensions, Elite.Data usage)
- **Best practices**: Show the "right way" to implement common scenarios
- **Current versions**: Use latest stable versions of frameworks and tools

### Template Structure

- **Clear sections**: Use descriptive headings that explain the purpose
- **Code comments**: Include explanatory comments in code blocks
- **Context**: Provide enough context to understand when to use each pattern

## 🔍 Quality Assurance

### Before Committing

- [ ] All markdown files pass linting (`npm run lint`)
- [ ] Content follows reference-based approach
- [ ] No manual table of contents
- [ ] All external links are to official sources
- [ ] No tool configuration redundancy
- [ ] Consistent file structure and naming

### Reviewing Changes

- **Accuracy**: Verify that referenced documentation is current and correct
- **Consistency**: Check that new content follows established patterns
- **Completeness**: Ensure examples include necessary context
- **Links**: Validate that all external links work and point to official sources

## 💡 Key Learnings

### Configuration Management

- **Single responsibility**: Each tool should have a clear, non-overlapping purpose
- **Hierarchy matters**: EditorConfig → Prettier → markdownlint (basic → style → content)
- **Avoid duplication**: Don't repeat settings across multiple configuration files

### Documentation Philosophy

- **Reference over recreation**: Link to official docs rather than rewriting them
- **GitHub integration**: Leverage GitHub's features (auto-TOC, syntax highlighting)
- **Elite focus**: Document only what's specific to Elite's conventions and choices

### Maintenance Strategy

- **Tooling enforces standards**: Use automated tools to maintain consistency
- **External links age better**: Official documentation stays current automatically
- **Regular updates**: Review and update Elite-specific conventions as needed

---

_Remember: The goal is to create documentation that stays current, remains useful, and helps developers follow Elite's
standards consistently._
