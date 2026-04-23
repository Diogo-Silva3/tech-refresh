#!/bin/bash

BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "=========================================="
echo "INICIANDO BACKUP COMPLETO DO SISTEMA"
echo "Data: $(date)"
echo "=========================================="

# Criar diretório de backup
mkdir -p $BACKUP_DIR

# 1. Backup do Banco de Dados
echo ""
echo "[1/4] Fazendo backup do banco de dados..."
sudo -u postgres pg_dump inventario_ti > $BACKUP_DIR/backup_banco_$TIMESTAMP.sql
if [ $? -eq 0 ]; then
  echo "✓ Backup do banco concluído"
  ls -lh $BACKUP_DIR/backup_banco_$TIMESTAMP.sql
else
  echo "✗ Erro ao fazer backup do banco"
fi

# 2. Backup do Backend
echo ""
echo "[2/4] Fazendo backup do backend..."
tar -czf $BACKUP_DIR/backup_backend_$TIMESTAMP.tar.gz /var/www/apps/tech-refresh-backend/
if [ $? -eq 0 ]; then
  echo "✓ Backup do backend concluído"
  ls -lh $BACKUP_DIR/backup_backend_$TIMESTAMP.tar.gz
else
  echo "✗ Erro ao fazer backup do backend"
fi

# 3. Backup do Frontend
echo ""
echo "[3/4] Fazendo backup do frontend..."
tar -czf $BACKUP_DIR/backup_frontend_$TIMESTAMP.tar.gz /var/www/apps/tech-refresh-frontend/
if [ $? -eq 0 ]; then
  echo "✓ Backup do frontend concluído"
  ls -lh $BACKUP_DIR/backup_frontend_$TIMESTAMP.tar.gz
else
  echo "✗ Erro ao fazer backup do frontend"
fi

# 4. Backup do Portal
echo ""
echo "[4/4] Fazendo backup do portal..."
tar -czf $BACKUP_DIR/backup_portal_$TIMESTAMP.tar.gz /var/www/apps/portal-tech-refresh/
if [ $? -eq 0 ]; then
  echo "✓ Backup do portal concluído"
  ls -lh $BACKUP_DIR/backup_portal_$TIMESTAMP.tar.gz
else
  echo "✗ Erro ao fazer backup do portal"
fi

echo ""
echo "=========================================="
echo "BACKUP COMPLETO CONCLUÍDO!"
echo "Arquivos salvos em: $BACKUP_DIR"
echo "=========================================="
ls -lh $BACKUP_DIR/backup_*_$TIMESTAMP.*
