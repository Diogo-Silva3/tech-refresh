@echo off
echo === Enviando atualizacoes do backend para GitHub ===
cd /d "C:\Temp\wickbold\inventario-ti\backend"
git add -A
git commit -m "update"
git push origin main

echo === Atualizando VPS ===
ssh root@187.127.8.112 "/root/deploy.sh"

echo === Deploy concluido ===
pause
