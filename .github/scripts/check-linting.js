const { execSync } = require('child_process');
const fs = require('fs');

try {
  // Run lint check and capture output
  const output = execSync('npm run lint:md', { 
    stdio: 'pipe',
    encoding: 'utf8'
  });
  
  // If we get here, linting passed
  fs.appendFileSync(process.env.GITHUB_OUTPUT, 'lint_status=✅ passed\n');
  fs.appendFileSync(process.env.GITHUB_OUTPUT, 'lint_details=All markdown files follow best practices\n');
  
} catch (error) {
  // Linting failed
  fs.appendFileSync(process.env.GITHUB_OUTPUT, 'lint_status=❌ failed\n');
  
  const output = error.stdout || error.stderr || '';
  const lintIssues = output.match(/MD\d+/g);
  
  if (lintIssues && lintIssues.length > 0) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, 'lint_details=Found markdown issues that need manual fixes\n');
  } else {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, 'lint_details=Linting failed - check logs for details\n');
  }
}
