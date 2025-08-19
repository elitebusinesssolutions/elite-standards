#!/bin/bash

# Format check script
if npm run format:check; then
    echo "format_status=✅ passed" >> $GITHUB_OUTPUT
    echo "format_details=All files are properly formatted" >> $GITHUB_OUTPUT
else
    echo "format_status=❌ failed" >> $GITHUB_OUTPUT
    echo "format_details=Some files need formatting. Run \`npm run format\` to fix." >> $GITHUB_OUTPUT
fi
