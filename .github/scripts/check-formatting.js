const { execSync } = require('child_process');
const fs = require('fs');

try {
  // Run format check
  execSync('npm run format:check', { stdio: 'pipe' });
  
  // If we get here, formatting passed
  fs.appendFileSync(process.env.GITHUB_OUTPUT, 'format_status=✅ passed\n');
  fs.appendFileSync(process.env.GITHUB_OUTPUT, 'format_details=All files are properly formatted\n');
  
} catch (error) {
  // Formatting failed
  fs.appendFileSync(process.env.GITHUB_OUTPUT, 'format_status=❌ failed\n');
  fs.appendFileSync(process.env.GITHUB_OUTPUT, 'format_details=Some files need formatting. Run `npm run format` to fix.\n');
}
