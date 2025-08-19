#!/bin/bash

# Create comment body based on results
FORMAT_STATUS="${1}"
FORMAT_DETAILS="${2}"
LINT_STATUS="${3}"
LINT_DETAILS="${4}"

if [[ "$FORMAT_STATUS" == *"✅"* && "$LINT_STATUS" == *"✅"* ]]; then
    OVERALL_STATUS="✅ **PASSED**"
    ACTION_MESSAGE="🎉 **Great job!** Your documentation follows Elite's standards perfectly."
else
    OVERALL_STATUS="❌ **FAILED**"
    ACTION_MESSAGE="🔧 **Action needed:** Please run \`npm run format\` locally to fix formatting issues and address any remaining linting errors manually."
fi

# Create the comment body
cat > comment_body.md << EOF
## 📚 Documentation Quality Check ${OVERALL_STATUS}

### Formatting Check
${FORMAT_STATUS} **Prettier Formatting**
${FORMAT_DETAILS}

### Linting Check  
${LINT_STATUS} **markdownlint Validation**
${LINT_DETAILS}

---

${ACTION_MESSAGE}

<details>
<summary>📖 Need help?</summary>

**To fix formatting issues:**
\`\`\`bash
npm run format
\`\`\`

**To check your changes:**
\`\`\`bash
npm run lint
\`\`\`

See our [Development Environment](../README.md#development-environment) documentation for more details.
</details>
EOF

echo "Comment body created successfully"
