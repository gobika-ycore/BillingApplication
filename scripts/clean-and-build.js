#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Cleaning React Native and Android build cache...\n');

// Step 1: Stop Metro bundler
console.log('Step 1: Stopping Metro bundler...');
try {
  if (process.platform === 'win32') {
    execSync('taskkill /f /im node.exe', { stdio: 'ignore' });
  } else {
    execSync('pkill -f "react-native start"', { stdio: 'ignore' });
  }
} catch (error) {
  // Ignore if no processes found
}

// Step 2: Clean npm cache
console.log('\nStep 2: Cleaning npm cache...');
try {
  execSync('npm start --reset-cache', { stdio: 'inherit' });
} catch (error) {
  console.log('npm start --reset-cache failed, continuing...');
}

// Step 3: Clean React Native cache
console.log('\nStep 3: Cleaning React Native cache...');
try {
  execSync('npx react-native start --reset-cache', { stdio: 'inherit' });
} catch (error) {
  console.log('React Native cache reset failed, continuing...');
}

// Step 4: Clean Android build
console.log('\nStep 4: Cleaning Android build...');
try {
  process.chdir('android');
  execSync('gradlew clean', { stdio: 'inherit' });
  process.chdir('..');
} catch (error) {
  console.log('Android clean failed, continuing...');
  process.chdir('..');
}

// Step 5: Clean gradle cache
console.log('\nStep 5: Cleaning gradle cache...');
try {
  const gradleCache = path.join(require('os').homedir(), '.gradle', 'caches');
  if (fs.existsSync(gradleCache)) {
    fs.rmSync(gradleCache, { recursive: true, force: true });
  }
} catch (error) {
  console.log('Gradle cache clean failed, continuing...');
}

// Step 6: Clean node_modules
console.log('\nStep 6: Cleaning node_modules...');
try {
  if (fs.existsSync('node_modules')) {
    fs.rmSync('node_modules', { recursive: true, force: true });
  }
  execSync('npm install', { stdio: 'inherit' });
} catch (error) {
  console.log('Node modules clean/install failed:', error.message);
}

// Step 7: Clean Android build directories
console.log('\nStep 7: Cleaning Android build directories...');
try {
  const buildDirs = ['android/app/build', 'android/build'];
  buildDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
} catch (error) {
  console.log('Android build directories clean failed, continuing...');
}

// Step 8: Run React Native doctor
console.log('\nStep 8: Running React Native doctor...');
try {
  execSync('npx react-native doctor', { stdio: 'inherit' });
} catch (error) {
  console.log('React Native doctor failed, continuing...');
}

// Step 9: Start fresh build
console.log('\nStep 9: Starting fresh build...');
try {
  execSync('npx react-native run-android', { stdio: 'inherit' });
} catch (error) {
  console.log('Build failed:', error.message);
}

console.log('\nBuild process completed!');
