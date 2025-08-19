# GitHub Actions Scripts

This directory contains Node.js scripts used by our GitHub Actions workflows to maintain clean and readable workflow
files.

## Scripts

### Documentation Quality Check Scripts

- **`check-formatting.js`** - Runs Prettier format check and sets outputs
- **`check-linting.js`** - Runs markdownlint validation and sets outputs
- **`create-comment.js`** - Creates PR comment body with quality check results
- **`final-status.js`** - Sets final workflow status based on all checks

## Usage

These scripts are automatically executed by the `documentation-quality.yml` workflow. They can also be run locally for
testing:

```bash
# Test formatting check
node ./.github/scripts/check-formatting.js

# Test linting check
node ./.github/scripts/check-linting.js

# Test comment creation (requires arguments)
node ./.github/scripts/create-comment.js "✅ passed" "All good" "❌ failed" "Issues found"

# Test final status check
node ./.github/scripts/final-status.js "✅ passed" "✅ passed"
```

## Output Files

- **`comment_body.md`** - Generated in `.github/` directory by `create-comment.js` for PR comments

## Benefits

- **Clean workflows**: Keep YAML files focused on orchestration
- **Cross-platform**: Node.js scripts work on Windows, macOS, and Linux
- **Reusable logic**: Scripts can be shared across multiple workflows
- **Easier testing**: Scripts can be executed and debugged independently
- **Version control**: Script changes are tracked separately from workflow logic
- **Organized structure**: Generated files are kept in `.github/` directory
