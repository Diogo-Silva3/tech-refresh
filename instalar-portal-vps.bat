@echo off
echo ========================================
echo   Instalar Portal na VPS
echo ========================================
echo.

set VPS_HOST=root@187.127.8.112

echo [1/3] Enviando script de configuracao...
scp configurar-portal-vps.sh %VPS_HOST%:/tmp/

echo.
echo [2/3] Dando permissao de execucao...
ssh %VPS_HOST% "chmod +x /tmp/configurar-portal-vps.sh"

echo.
echo [3/3] Executando configuracao na VPS...
echo.
echo IMPORTANTE: Voce precisara editar o arquivo .env na VPS!
echo.
pause

ssh %VPS_HOST% "/tmp/configurar-portal-vps.sh"

echo.
echo ========================================
echo   Instalacao concluida!
echo ========================================
echo.
echo Proximos passos:
echo 1. Conecte na VPS: ssh %VPS_HOST%
echo 2. Edite o arquivo: nano /var/www/apps/portal-tech-refresh/.env
echo 3. Configure JWT_SECRET e DATABASE_URL
echo 4. Execute: deploy-portal.bat
echo.
pause
