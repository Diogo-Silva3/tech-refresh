@echo off
echo === CORRIGINDO H45C9H4 PARA ESTADO FINAL NA VPS ===
echo.

REM Fazer upload do script
echo [1/3] Enviando script para VPS...
scp backend/corrigir-h45c9h4-final.js root@187.127.8.112:/var/www/apps/tech-refresh-backend/

REM Executar o script
echo.
echo [2/3] Executando script na VPS...
ssh root@187.127.8.112 "cd /var/www/apps/tech-refresh-backend && node corrigir-h45c9h4-final.js"

REM Reiniciar backend
echo.
echo [3/3] Reiniciando backend...
ssh root@187.127.8.112 "pm2 restart ntt-backend"

echo.
echo === CONCLUIDO ===
echo Aguarde alguns segundos e verifique o dashboard.
pause
