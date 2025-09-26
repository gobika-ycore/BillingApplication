#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// JavaScript script to clean merge conflicts from files

function cleanMergeConflicts(filePath) {
  try {
    console.log(`Cleaning merge conflicts from ${filePath}...`);
    
    if (!fs.existsSync(filePath)) {
      console.log(`File ${filePath} does not exist.`);
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove Git merge conflict markers and keep the HEAD version
    content = content.replace(/<<<<<<< HEAD\r?\n/g, '');
    content = content.replace(/=======.*?>>>>>>> [a-f0-9]+\r?\n/gs, '');
    content = content.replace(/>>>>>>> [a-f0-9]+\r?\n/g, '');
    
    // Write the cleaned content back to the file
    fs.writeFileSync(filePath, content, 'utf8');
    
    console.log(`Merge conflicts cleaned from ${filePath}`);
    return true;
  } catch (error) {
    console.error(`Error cleaning merge conflicts from ${filePath}:`, error.message);
    return false;
  }
}

// Clean merge conflicts from common files
const filesToClean = [
  'screens/SalesBillScreen.js',
  'screens/CollectionBillScreen.js',
  'screens/CustomerDataScreen.js',
  'package.json',
  'package-lock.json'
];

let cleanedFiles = 0;
filesToClean.forEach(file => {
  if (cleanMergeConflicts(file)) {
    cleanedFiles++;
  }
});

console.log(`\nCleaned merge conflicts from ${cleanedFiles} files`);
console.log('Files are now ready for commit and push to GitHub');
