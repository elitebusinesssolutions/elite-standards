# GitHub Actions Scripts

This directory contains shell scripts used by our GitHub Actions workflows to maintain clean and readable workflow
files.

## Scripts

### Documentation Quality Check Scripts

- **`check-formatting.sh`** - Runs Prettier format check and sets outputs
- **`check-linting.sh`** - Runs markdownlint validation and sets outputs
- **`create-comment.sh`** - Creates PR comment body with quality check results
- **`final-status.sh`** - Sets final workflow status based on all checks

## Usage

These scripts are automatically executed by the `documentation-quality.yml` workflow. They can also be run locally for
testing:

```bash
# Test formatting check
./.github/scripts/check-formatting.sh

# Test linting check
./.github/scripts/check-linting.sh

# Test comment creation (requires arguments)
./.github/scripts/create-comment.sh "✅ passed" "All good" "❌ failed" "Issues found"
```

## Benefits

- **Clean workflows**: Keep YAML files focused on orchestration
- **Reusable logic**: Scripts can be shared across multiple workflows
- **Easier testing**: Scripts can be executed and debugged independently
- **Version control**: Script changes are tracked separately from workflow logic
