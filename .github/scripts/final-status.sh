#!/bin/bash

# Final status check script
format_ok="${1}"
lint_ok="${2}"

if [[ "$format_ok" == *"✅"* && "$lint_ok" == *"✅"* ]]; then
    echo "✅ All documentation quality checks passed!"
    echo "📚 Your documentation follows Elite's standards perfectly."
    exit 0
else
    echo "❌ Documentation quality checks failed!"
    echo "Please check the PR comment for detailed results and fix the issues."
    exit 1
fi
