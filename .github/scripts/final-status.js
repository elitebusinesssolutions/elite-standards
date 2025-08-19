// Get arguments
const formatStatus = process.argv[2];
const lintStatus = process.argv[3];

// Check if both passed
const formatPassed = formatStatus && formatStatus.includes('✅');
const lintPassed = lintStatus && lintStatus.includes('✅');

if (formatPassed && lintPassed) {
  console.log('✅ All documentation quality checks passed!');
  console.log('📚 Your documentation follows Elite\'s standards perfectly.');
  process.exit(0);
} else {
  console.log('❌ Documentation quality checks failed!');
  console.log('Please check the PR comment for detailed results and fix the issues.');
  process.exit(1);
}
