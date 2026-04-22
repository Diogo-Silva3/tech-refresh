#!/bin/bash

# Configurações
BACKUP_DIR="/var/backups/sistema"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7

# Criar diretório de backup
mkdir -p $BACKUP_DIR

echo "=== Iniciando backup completo em $DATE ==="

# 1. Backup do PostgreSQL
echo "1. Fazendo backup do banco de dados..."
sudo -u postgres pg_dumpall > $BACKUP_DIR/db_$DATE.sql
gzip $BACKUP_DIR/db_$DATE.sql
echo "   ✓ Banco de dados: db_$DATE.sql.gz"

# 2. Backup dos arquivos do backend
echo "2. Fazendo backup do backend..."
tar -czf $BACKUP_DIR/backend_$DATE.tar.gz \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='*.log' \
  -C /var/www/apps tech-refresh-backend
echo "   ✓ Backend: backend_$DATE.tar.gz"

# 3. Backup dos arquivos do frontend
echo "3. Fazendo backup do frontend..."
tar -czf $BACKUP_DIR/frontend_$DATE.tar.gz \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='dist' \
  -C /var/www/apps tech-refresh-frontend
echo "   ✓ Frontend: frontend_$DATE.tar.gz"

# 4. Backup dos arquivos estáticos (uploads, imagens, etc)
if [ -d "/var/www/asset" ]; then
  echo "4. Fazendo backup dos assets..."
  tar -czf $BACKUP_DIR/assets_$DATE.tar.gz -C /var/www asset
  echo "   ✓ Assets: assets_$DATE.tar.gz"
fi

# 5. Criar um arquivo com informações do backup
cat > $BACKUP_DIR/info_$DATE.txt <<EOF
Backup realizado em: $(date)
Servidor: $(hostname)
Sistema: $(uname -a)
Espaço em disco:
$(df -h)

Arquivos incluídos:
- Banco de dados PostgreSQL (completo)
- Backend (código + .env)
- Frontend (código)
- Assets (uploads/imagens)

Para restaurar:
1. Banco: gunzip -c db_$DATE.sql.gz | sudo -u postgres psql
2. Backend: tar -xzf backend_$DATE.tar.gz -C /var/www/apps
3. Frontend: tar -xzf frontend_$DATE.tar.gz -C /var/www/apps
4. Assets: tar -xzf assets_$DATE.tar.gz -C /var/www
EOF

# 6. Remover backups antigos (mantém apenas os últimos X dias)
echo "5. Limpando backups antigos (mantendo últimos $RETENTION_DAYS dias)..."
find $BACKUP_DIR -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "info_*.txt" -mtime +$RETENTION_DAYS -delete

# 7. Mostrar resumo
echo ""
echo "=== Backup concluído! ==="
echo "Localização: $BACKUP_DIR"
echo "Arquivos criados:"
ls -lh $BACKUP_DIR/*$DATE* 2>/dev/null || echo "Nenhum arquivo encontrado"
echo ""
echo "Espaço usado pelos backups:"
du -sh $BACKUP_DIR
echo ""
echo "Backups disponíveis:"
ls -lh $BACKUP_DIR | grep -E "\.gz$|\.txt$" | wc -l
echo " arquivos"
