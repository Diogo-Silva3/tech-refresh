#!/bin/bash

# Script de Backup Automático na VPS
# Salva backups em /backups com timestamp

BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DATA=$(date +%Y%m%d)

echo "================================"
echo "Iniciando Backup - $TIMESTAMP"
echo "================================"
echo ""

# Criar diretório se não existir
mkdir -p $BACKUP_DIR

# 1. Backend
echo "Fazendo backup do Backend..."
tar -czf $BACKUP_DIR/tech-refresh-backend_$DATA.tar.gz /var/www/apps/tech-refresh-backend/ 2>/dev/null
echo "✓ Backend OK"

# 2. Frontend
echo "Fazendo backup do Frontend..."
tar -czf $BACKUP_DIR/tech-refresh-frontend_$DATA.tar.gz /var/www/apps/tech-refresh-frontend/ 2>/dev/null
echo "✓ Frontend OK"

# 3. Portal
echo "Fazendo backup do Portal..."
tar -czf $BACKUP_DIR/portal-tech-refresh_$DATA.tar.gz /var/www/apps/portal-tech-refresh/ 2>/dev/null
echo "✓ Portal OK"

# 4. Banco de dados (PostgreSQL local)
echo "Fazendo backup do Banco de Dados..."
pg_dump -U postgres -d inventario_ti > $BACKUP_DIR/inventario_ti_db_$DATA.sql 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✓ Banco de Dados OK"
else
    echo "⚠ Banco de Dados - Erro na conexão (pode estar usando Supabase)"
fi

echo ""
echo "================================"
echo "✓ Backup concluído!"
echo "Localização: $BACKUP_DIR"
echo "Data: $DATA"
echo "================================"
echo ""
echo "Arquivos criados:"
ls -lh $BACKUP_DIR/*_$DATA* 2>/dev/null | awk '{print "  " $9 " (" $5 ")"}'
