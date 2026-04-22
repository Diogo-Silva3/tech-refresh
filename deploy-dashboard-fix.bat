@echo off
echo === CORRIGINDO DASHBOARD NA VPS ===
echo.

REM Fazer upload do arquivo corrigido
echo [1/2] Enviando dashboard.controller.js para VPS...
scp backend/src/controllers/dashboard.controller.js root@187.127.8.112:/var/www/apps/tech-refresh-backend/src/controllers/

REM Reiniciar backend
echo.
echo [2/2] Reiniciando backend...
ssh root@187.127.8.112 "pm2 restart ntt-backend"

echo.
echo === CONCLUIDO ===
echo Aguarde alguns segundos e verifique o dashboard.
pause
