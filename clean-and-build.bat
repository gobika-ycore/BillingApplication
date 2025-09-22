@echo off
echo Cleaning React Native and Android build cache...

echo.
echo Step 1: Stopping Metro bundler...
taskkill /f /im node.exe 2>nul

echo.
echo Step 2: Cleaning npm cache...
npm start --reset-cache

echo.
echo Step 3: Cleaning React Native cache...
npx react-native start --reset-cache

echo.
echo Step 4: Cleaning Android build...
cd android
call gradlew clean
cd ..

echo.
echo Step 5: Cleaning gradle cache...
rmdir /s /q "%USERPROFILE%\.gradle\caches" 2>nul

echo.
echo Step 6: Cleaning node_modules...
rmdir /s /q node_modules 2>nul
npm install

echo.
echo Step 7: Cleaning Android build directories...
rmdir /s /q android\app\build 2>nul
rmdir /s /q android\build 2>nul

echo.
echo Step 8: Running React Native doctor...
npx react-native doctor

echo.
echo Step 9: Starting fresh build...
npx react-native run-android

echo.
echo Build process completed!
pause
