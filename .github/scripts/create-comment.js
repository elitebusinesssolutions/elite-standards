const fs = require('fs');

// Get arguments
const formatStatus = process.argv[2];
const formatDetails = process.argv[3];
const lintStatus = process.argv[4];
const lintDetails = process.argv[5];

// Determine overall status
const isOverallPass = formatStatus.includes('✅') && lintStatus.includes('✅');
const overallStatus = isOverallPass ? '✅ **PASSED**' : '❌ **FAILED**';

const actionMessage = isOverallPass
  ? "🎉 **Great job!** Your documentation follows Elite's standards perfectly."
  : '🔧 **Action needed:** Please run `npm run format` locally to fix formatting issues and address any remaining linting errors manually.';

// Create comment body
const commentBody = `## 📚 Documentation Quality Check ${overallStatus}

### Formatting Check
${formatStatus} **Prettier Formatting**
${formatDetails}

### Linting Check  
${lintStatus} **markdownlint Validation**
${lintDetails}

---

${actionMessage}

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
</details>`;

// Write comment body to file
fs.writeFileSync('.github/comment_body.md', commentBody);

console.log('Comment body created successfully');
