# Script para reiniciar o frontend na VPS
# Executa comandos SSH na VPS

Write-Host "🔄 Reiniciando frontend na VPS..." -ForegroundColor Green
Write-Host ""

# Conecta na VPS e executa os comandos
$commands = @"
cd /var/www/apps/tech-refresh-frontend
echo "📁 Diretório: `$(pwd)"
echo ""
echo "📊 Status atual do pm2:"
pm2 list
echo ""
echo "⏹️  Parando ntt-frontend..."
pm2 stop ntt-frontend 2>/dev/null || true
pm2 delete ntt-frontend 2>/dev/null || true
echo ""
echo "▶️  Iniciando ntt-frontend..."
pm2 start "npm run preview" --name ntt-frontend
echo ""
pm2 save
echo ""
echo "✅ Status final:"
pm2 list
"@

ssh -t root@187.127.8.112 $commands

Write-Host ""
Write-Host "✅ Frontend reiniciado na VPS!" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Yellow
Write-Host "1. Faça logout e login como PEDRO SEVERO"
Write-Host "2. Vá para Preparação"
Write-Host "3. Verifique se 'Ag. Entrega' mostra 1 equipamento"
