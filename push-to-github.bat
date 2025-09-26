@echo off
echo ========================================
echo   PUSHING BILLING APP TO GITHUB
echo ========================================
echo.

echo Step 1: Checking Git status...
git status
echo.

echo Step 2: Adding all files to staging...
git add .
echo.

echo Step 3: Committing changes...
git commit -m "Add comprehensive payment functionality to SalesBillScreen

- Added payment method selection (Cash, UPI, Credit)
- Implemented payment modal with QR code support
- Enhanced bill cards with payment information
- Added payment status tracking and validation
- Fixed merge conflicts and cleaned up code
- Ready for production use"
echo.

echo Step 4: Pushing to GitHub...
git push origin main
echo.

if %ERRORLEVEL% EQU 0 (
    echo ========================================
    echo   SUCCESS! Code pushed to GitHub
    echo ========================================
    echo.
    echo Your billing application with payment functionality
    echo has been successfully pushed to your GitHub repository!
    echo.
) else (
    echo ========================================
    echo   PUSH FAILED - Please check the error above
    echo ========================================
    echo.
    echo Common solutions:
    echo 1. Make sure you're connected to the internet
    echo 2. Check if you have push permissions to the repository
    echo 3. Verify the remote repository URL with: git remote -v
    echo.
)

pause
