@echo off
echo ========================================
echo   Deploy Portal Tech Refresh para VPS
echo ========================================
echo.

set VPS_HOST=root@187.127.8.112
set VPS_PATH=/var/www/apps/portal-tech-refresh

echo [1/5] Conectando na VPS...
ssh %VPS_HOST% "mkdir -p %VPS_PATH%"

echo.
echo [2/5] Enviando arquivos do portal...
scp -r portal/* %VPS_HOST%:%VPS_PATH%/

echo.
echo [3/5] Instalando dependencias...
ssh %VPS_HOST% "cd %VPS_PATH% && npm install"

echo.
echo [4/5] Gerando Prisma Client...
ssh %VPS_HOST% "cd %VPS_PATH% && npx prisma generate"

echo.
echo [5/5] Reiniciando aplicacao com PM2...
ssh %VPS_HOST% "pm2 restart portal-tech-refresh || pm2 start %VPS_PATH%/server.js --name portal-tech-refresh"

echo.
echo ========================================
echo   Deploy concluido com sucesso!
echo   Portal: https://portal.tech-refresh.cloud
echo ========================================
echo.
pause
