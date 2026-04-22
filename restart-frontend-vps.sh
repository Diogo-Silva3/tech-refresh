#!/bin/bash

# Script para reiniciar o frontend na VPS
# Quando pedir senha, você insere aqui

echo "🔄 Reiniciando frontend na VPS..."
echo ""

# Conecta na VPS e executa os comandos
ssh -t root@187.127.8.112 << 'EOF'
  echo "📍 Conectado na VPS"
  echo ""
  
  # Vai para o diretório do frontend
  cd /var/www/apps/tech-refresh-frontend
  echo "📁 Diretório: $(pwd)"
  echo ""
  
  # Verifica status do pm2
  echo "📊 Status atual do pm2:"
  pm2 list
  echo ""
  
  # Para o processo se estiver rodando
  echo "⏹️  Parando ntt-frontend..."
  pm2 stop ntt-frontend 2>/dev/null || true
  pm2 delete ntt-frontend 2>/dev/null || true
  echo ""
  
  # Inicia o frontend
  echo "▶️  Iniciando ntt-frontend..."
  pm2 start "npm run preview" --name ntt-frontend
  echo ""
  
  # Salva a configuração do pm2
  pm2 save
  echo ""
  
  # Mostra status final
  echo "✅ Status final:"
  pm2 list
  echo ""
  
  # Mostra logs
  echo "📋 Últimos logs:"
  pm2 logs ntt-frontend --lines 10 --nostream
EOF

echo ""
echo "✅ Frontend reiniciado na VPS!"
echo ""
echo "Próximos passos:"
echo "1. Faça logout e login como PEDRO SEVERO"
echo "2. Vá para Preparação"
echo "3. Verifique se 'Ag. Entrega' mostra 1 equipamento"
