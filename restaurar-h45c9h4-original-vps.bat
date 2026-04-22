@echo off
echo === RESTAURANDO H45C9H4 PARA ESTADO ORIGINAL NA VPS ===
echo.

REM Fazer upload do script
echo [1/3] Enviando script para VPS...
scp backend/restaurar-h45c9h4-original.js root@187.127.8.112:/var/www/apps/tech-refresh-backend/

REM Executar o script
echo.
echo [2/3] Executando script na VPS...
ssh root@187.127.8.112 "cd /var/www/apps/tech-refresh-backend && node restaurar-h45c9h4-original.js"

REM Reiniciar backend
echo.
echo [3/3] Reiniciando backend...
ssh root@187.127.8.112 "pm2 restart ntt-backend"

echo.
echo === CONCLUIDO ===
echo Aguarde alguns segundos e verifique o dashboard.
pause
