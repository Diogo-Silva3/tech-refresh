@echo off
echo === Build do frontend ===
cd /d "C:\Temp\wickbold\inventario-ti\frontend"
call npx vite build

echo === Enviando para VPS ===
scp -r "C:\Temp\wickbold\inventario-ti\frontend\dist\*" root@187.127.8.112:/var/www/frontend/

echo === Deploy concluido ===
pause
