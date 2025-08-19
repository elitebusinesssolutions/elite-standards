const core = require('@actions/core');
const github = require('@actions/github');

async function postQualityCheckComment() {
  try {
    // Get inputs from the workflow
    const token = core.getInput('github-token');
    const formatStatus = core.getInput('format-status');
    const formatDetails = core.getInput('format-details');
    const lintStatus = core.getInput('lint-status');
    const lintDetails = core.getInput('lint-details');
    
    // Create GitHub client
    const octokit = github.getOctokit(token);
    
    // Determine overall status
    const overallStatus = formatStatus.includes('✅') && lintStatus.includes('✅') 
      ? '✅ **PASSED**' 
      : '❌ **FAILED**';
    
    // Create comment body
    const body = `## 📚 Documentation Quality Check ${overallStatus}

### Formatting Check
${formatStatus} **Prettier Formatting**
${formatDetails}

### Linting Check  
${lintStatus} **markdownlint Validation**
${lintDetails}

---

${overallStatus.includes('✅') 
  ? '🎉 **Great job!** Your documentation follows Elite\'s standards perfectly.' 
  : '🔧 **Action needed:** Please run \`npm run format\` locally to fix formatting issues and address any remaining linting errors manually.'}

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

    // Post the comment
    await octokit.rest.issues.createComment({
      issue_number: github.context.issue.number,
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      body: body
    });
    
    console.log('✅ Quality check comment posted successfully');
    
  } catch (error) {
    core.setFailed(`Failed to post comment: ${error.message}`);
  }
}

postQualityCheckComment();
