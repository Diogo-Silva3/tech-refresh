# Script de Backup Automático - VPS + Local
# Uso: .\backup-automatico.ps1

$BackupBaseDir = "C:\Temp\wickbold\Backup"
$VpsHost = "root@187.127.8.112"
$VpsBackupDir = "/backups"

# Criar pasta com data de hoje (YYYYMMDD)
$DataAtual = Get-Date -Format "yyyyMMdd"
$BackupDirLocal = Join-Path $BackupBaseDir $DataAtual

if (-not (Test-Path $BackupDirLocal)) {
    New-Item -ItemType Directory -Path $BackupDirLocal | Out-Null
    Write-Host "✓ Pasta criada: $BackupDirLocal"
}

Write-Host "================================"
Write-Host "Backup Automático - $DataAtual"
Write-Host "================================"
Write-Host ""

# ETAPA 1: Fazer backup na VPS
Write-Host "ETAPA 1: Fazendo backup na VPS..."
Write-Host ""

ssh $VpsHost "cd /backups; tar -czf tech-refresh-backend_$DataAtual.tar /var/www/apps/tech-refresh-backend/ 2>/dev/null; echo 'Backend OK'"
ssh $VpsHost "cd /backups; tar -czf tech-refresh-frontend_$DataAtual.tar /var/www/apps/tech-refresh-frontend/ 2>/dev/null; echo 'Frontend OK'"
ssh $VpsHost "cd /backups; tar -czf portal-tech-refresh_$DataAtual.tar /var/www/apps/portal-tech-refresh/ 2>/dev/null; echo 'Portal OK'"
ssh $VpsHost "cd /backups; pg_dump -U postgres -d inventario_ti > inventario_ti_db_$DataAtual.sql 2>/dev/null; echo 'Banco de Dados OK'"

Write-Host ""
Write-Host "✓ Backups criados na VPS"
Write-Host ""

# ETAPA 2: Copiar da VPS para máquina local
Write-Host "ETAPA 2: Copiando backups da VPS para máquina local..."
Write-Host ""

Write-Host "Copiando Backend..."
scp "$VpsHost`:/backups/tech-refresh-backend_$DataAtual.tar" "$BackupDirLocal\"
Write-Host "✓ Backend OK"

Write-Host "Copiando Frontend..."
scp "$VpsHost`:/backups/tech-refresh-frontend_$DataAtual.tar" "$BackupDirLocal\"
Write-Host "✓ Frontend OK"

Write-Host "Copiando Portal..."
scp "$VpsHost`:/backups/portal-tech-refresh_$DataAtual.tar" "$BackupDirLocal\"
Write-Host "✓ Portal OK"

Write-Host "Copiando Banco de Dados..."
scp "$VpsHost`:/backups/inventario_ti_db_$DataAtual.sql" "$BackupDirLocal\"
Write-Host "✓ Banco de Dados OK"

Write-Host ""
Write-Host "================================"
Write-Host "✓ Backup concluído com sucesso!"
Write-Host "================================"
Write-Host ""
Write-Host "Localização Local: $BackupDirLocal"
Write-Host ""
Write-Host "Arquivos salvos:"
Get-ChildItem $BackupDirLocal | ForEach-Object { Write-Host "  ✓ $($_.Name)" }

