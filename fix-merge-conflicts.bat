@echo off
echo Fixing merge conflicts and preparing for GitHub push...
echo.

echo Step 1: Backing up current file...
copy "screens\SalesBillScreen.js" "screens\SalesBillScreen_backup.js"

echo Step 2: Git status check...
git status

echo.
echo Step 3: Add files to staging...
git add .

echo Step 4: Commit changes...
git commit -m "Fix merge conflicts and add payment functionality to SalesBillScreen"

echo Step 5: Push to GitHub...
git push origin main

echo.
echo Merge conflicts fixed and pushed to GitHub!
echo.
pause
