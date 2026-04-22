@echo off
echo === Corrigindo backend na VPS ===
ssh root@187.127.8.112 "cd /var/www/backend && rm -f ativar-tecnicos.js cadastrar-tecnicos-faltantes.js importar-planilha.js importar-solicitacoes.js verificar-duplicatas.js && git stash && git pull origin main && npm install && npx prisma generate && pm2 restart ntt-backend && pm2 status"
echo === Correcao concluida ===
pause
