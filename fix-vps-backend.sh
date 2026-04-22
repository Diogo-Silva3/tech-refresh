#!/bin/bash
cd /root/ntt-device-control-backend

echo "=== Salvando alterações locais ==="
git stash

echo "=== Atualizando do GitHub ==="
git pull origin main

echo "=== Reinstalando dependências ==="
npm install

echo "=== Gerando Prisma Client ==="
npx prisma generate

echo "=== Reiniciando PM2 ==="
pm2 restart ntt-backend

echo "=== Status do serviço ==="
pm2 status

echo "=== Deploy corrigido! ==="
