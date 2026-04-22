@echo off
echo ========================================
echo   Deploy Portal Tech Refresh para VPS
echo ========================================
echo.

set VPS_HOST=root@187.127.8.112
set VPS_PATH=/var/www/apps/portal-tech-refresh

echo [1/5] Criando diretorio na VPS...
ssh %VPS_HOST% "mkdir -p %VPS_PATH%"

echo.
echo [2/5] Enviando arquivos do portal...
scp -r portal\*.html %VPS_HOST%:%VPS_PATH%/
scp -r portal\*.png %VPS_HOST%:%VPS_PATH%/
scp -r portal\server-simples.js %VPS_HOST%:%VPS_PATH%/
scp -r portal\package.json %VPS_HOST%:%VPS_PATH%/

echo.
echo [3/5] Instalando dependencias...
ssh %VPS_HOST% "cd %VPS_PATH% && npm install"

echo.
echo [4/5] Configurando .env...
ssh %VPS_HOST% "cat > %VPS_PATH%/.env << 'EOF'
PORT=3002
JWT_SECRET=ntt-device-control-jwt-secret-2024-wickbold
BACKEND_URL=https://tech-refresh.cloud/api
FRONTEND_URL=https://portal.tech-refresh.cloud
EOF"

echo.
echo [5/5] Reiniciando aplicacao com PM2...
ssh %VPS_HOST% "pm2 restart portal-tech-refresh || pm2 start %VPS_PATH%/server-simples.js --name portal-tech-refresh && pm2 save"

echo.
echo ========================================
echo   Deploy concluido com sucesso!
echo   Portal: https://portal.tech-refresh.cloud
echo ========================================
echo.
pause
