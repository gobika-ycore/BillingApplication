@echo off
echo Installing Payment Dependencies for Billing Application...
echo.

echo Installing QR Code libraries...
npm install react-native-qrcode-svg react-native-svg

echo.
echo Linking native dependencies (for React Native < 0.60)...
echo If you're using React Native 0.60+, auto-linking should handle this.

echo.
echo Installation completed!
echo.
echo Next steps:
echo 1. Update UPI ID in SalesBillScreen.js (line 74)
echo 2. Uncomment QRCode import and usage in SalesBillScreen.js (line 16 and 833)
echo 3. Run: npx react-native run-android (or ios)
echo.
pause
