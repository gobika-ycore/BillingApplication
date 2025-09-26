#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('========================================');
console.log('   PUSHING BILLING APP TO GITHUB');
console.log('========================================\n');

try {
  console.log('Step 1: Checking Git status...');
  execSync('git status', { stdio: 'inherit' });
  console.log();

  console.log('Step 2: Adding all files to staging...');
  execSync('git add .', { stdio: 'inherit' });
  console.log();

  console.log('Step 3: Committing changes...');
  const commitMessage = `Add comprehensive payment functionality to SalesBillScreen

- Added payment method selection (Cash, UPI, Credit)
- Implemented payment modal with QR code support
- Enhanced bill cards with payment information
- Added payment status tracking and validation
- Fixed merge conflicts and cleaned up code
- Ready for production use`;

  execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
  console.log();

  console.log('Step 4: Pushing to GitHub...');
  execSync('git push origin main', { stdio: 'inherit' });
  console.log();

  console.log('========================================');
  console.log('   SUCCESS! Code pushed to GitHub');
  console.log('========================================\n');
  console.log('Your billing application with payment functionality');
  console.log('has been successfully pushed to your GitHub repository!\n');

} catch (error) {
  console.log('========================================');
  console.log('   PUSH FAILED - Please check the error above');
  console.log('========================================\n');
  console.log('Common solutions:');
  console.log('1. Make sure you\'re connected to the internet');
  console.log('2. Check if you have push permissions to the repository');
  console.log('3. Verify the remote repository URL with: git remote -v\n');
  
  process.exit(1);
}
