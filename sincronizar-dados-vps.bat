@echo off
echo ========================================
echo Sincronizando dados no VPS
echo ========================================
echo.

cd /d "C:\Temp\wickbold\inventario-ti"

echo Enviando script para GitHub...
cd backend
git add sincronizar-statusprocesso-com-vinculacoes.js
git commit -m "Script de sincronizacao de dados"
git push origin main

echo.
echo Executando no VPS...
ssh root@187.127.8.112 "cd /root/inventario-ti/backend && git pull && node sincronizar-statusprocesso-com-vinculacoes.js"

echo.
echo ========================================
echo Concluido!
echo ========================================
pause
