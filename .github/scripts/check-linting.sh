#!/bin/bash

# Lint check script
if npm run lint:md 2>&1 | tee lint-output.txt; then
    echo "lint_status=✅ passed" >> $GITHUB_OUTPUT
    echo "lint_details=All markdown files follow best practices" >> $GITHUB_OUTPUT
else
    echo "lint_status=❌ failed" >> $GITHUB_OUTPUT
    lint_issues=$(cat lint-output.txt | grep -E "MD[0-9]+" | head -10)
    if [ -n "$lint_issues" ]; then
        echo "lint_details=Found markdown issues that need manual fixes" >> $GITHUB_OUTPUT
    else
        echo "lint_details=Linting failed - check logs for details" >> $GITHUB_OUTPUT
    fi
fi
