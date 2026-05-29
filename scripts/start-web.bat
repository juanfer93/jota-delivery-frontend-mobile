@echo off
set EXPO_WEB_NO_OPEN=1
echo 🚀 Iniciando Jota Delivery Web en LAN...
echo 💡 URL para móvil: http://192.168.1.10:8081
echo.
npx expo start --web --host lan --clear
pause