@echo off
echo ========================================
echo    QUICK FIX - BILLING APP
echo ========================================
echo.

echo [1/5] Killing all processes...
taskkill /F /IM node.exe 2>nul
taskkill /F /IM adb.exe 2>nul
taskkill /F /IM java.exe 2>nul

echo [2/5] Cleaning Metro cache...
npx react-native start --reset-cache &
timeout /t 2 >nul
taskkill /F /IM node.exe 2>nul

echo [3/5] Cleaning Android build...
cd android
gradlew clean
cd ..

echo [4/5] Starting Metro...
start "Metro" cmd /k "npx react-native start --port=8081"
timeout /t 5 >nul

echo [5/5] Running app...
npx react-native run-android --port=8081

echo.
echo ========================================
echo    QUICK FIX COMPLETE!
echo ========================================
pause
