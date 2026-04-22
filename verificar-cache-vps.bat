@echo off
echo === VERIFICANDO CACHE DO DASHBOARD NA VPS ===
echo.

REM Fazer upload do script
echo [1/2] Enviando script para VPS...
scp backend/verificar-cache-dashboard.js root@187.127.8.112:/var/www/apps/tech-refresh-backend/

REM Executar o script
echo.
echo [2/2] Executando script na VPS...
ssh root@187.127.8.112 "cd /var/www/apps/tech-refresh-backend && node verificar-cache-dashboard.js"

echo.
echo === CONCLUIDO ===
pause
