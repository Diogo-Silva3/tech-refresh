@echo off
echo === DEBUG: POR QUE ATRIBUÍDO MOSTRA 35? ===
echo.

REM Fazer upload do script
echo [1/2] Enviando script para VPS...
scp backend/debug-atribuido-35.js root@187.127.8.112:/var/www/apps/tech-refresh-backend/

REM Executar o script
echo.
echo [2/2] Executando script na VPS...
ssh root@187.127.8.112 "cd /var/www/apps/tech-refresh-backend && node debug-atribuido-35.js"

echo.
echo === CONCLUIDO ===
pause
