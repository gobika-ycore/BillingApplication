@echo off
echo ========================================
echo    BILLING APP - FIX AND BUILD SCRIPT
echo ========================================
echo.

echo [1/10] Stopping all Node processes...
taskkill /F /IM node.exe 2>nul
taskkill /F /IM adb.exe 2>nul
timeout /t 2 >nul

echo [2/10] Cleaning React Native cache...
npx react-native start --reset-cache --port=8081 &
timeout /t 3 >nul
taskkill /F /IM node.exe 2>nul

echo [3/10] Cleaning npm cache...
npm cache clean --force

echo [4/10] Cleaning node_modules...
if exist node_modules (
    echo Removing node_modules...
    rmdir /s /q node_modules
)

echo [5/10] Cleaning temp directories...
if exist %TEMP%\react-native-* (
    rmdir /s /q %TEMP%\react-native-*
)
if exist %TEMP%\metro-* (
    rmdir /s /q %TEMP%\metro-*
)

echo [6/10] Installing dependencies...
npm install

echo [7/10] Cleaning Android build...
cd android
echo Cleaning Gradle cache...
gradlew clean
gradlew --stop
if exist build (
    rmdir /s /q build
)
if exist app\build (
    rmdir /s /q app\build
)
cd ..

echo [8/10] Clearing React Native cache...
npx react-native start --reset-cache &
timeout /t 3 >nul
taskkill /F /IM node.exe 2>nul

echo [9/10] Starting Metro server...
start "Metro Server" cmd /k "npx react-native start --port=8081"
timeout /t 8 >nul

echo [10/10] Building and running Android app...
npx react-native run-android --port=8081

echo.
echo ========================================
echo    BUILD COMPLETE!
echo    If you see errors, try running this script again.
echo ========================================
pause
