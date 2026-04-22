# Script para copiar backups para a nuvem
# Suporta: Google Drive, OneDrive, Dropbox, etc

param(
    [string]$DataBackup = (Get-Date -Format "yyyyMMdd"),
    [string]$NuvemPath = "C:\Users\$env:USERNAME\OneDrive\Documentos\Backups"  # Altere conforme sua nuvem
)

$BackupBaseDir = "C:\Temp\wickbold\Backup"
$BackupDirLocal = Join-Path $BackupBaseDir $DataBackup

Write-Host "================================"
Write-Host "Enviando Backup para Nuvem"
Write-Host "================================"
Write-Host ""

# Verificar se pasta de backup existe
if (-not (Test-Path $BackupDirLocal)) {
    Write-Host "✗ Pasta de backup não encontrada: $BackupDirLocal"
    exit 1
}

# Criar pasta na nuvem se não existir
$NuvemBackupDir = Join-Path $NuvemPath $DataBackup
if (-not (Test-Path $NuvemBackupDir)) {
    New-Item -ItemType Directory -Path $NuvemBackupDir | Out-Null
    Write-Host "✓ Pasta criada na nuvem: $NuvemBackupDir"
}

Write-Host ""
Write-Host "Copiando arquivos para nuvem..."
Write-Host ""

# Copiar todos os arquivos
$Arquivos = Get-ChildItem $BackupDirLocal
foreach ($Arquivo in $Arquivos) {
    Write-Host "Copiando: $($Arquivo.Name)..."
    Copy-Item -Path $Arquivo.FullName -Destination $NuvemBackupDir -Force
    $TamanhoMB = [math]::Round($Arquivo.Length/1MB, 2)
    Write-Host "✓ $($Arquivo.Name) ($TamanhoMB MB) OK"
}

Write-Host ""
Write-Host "================================"
Write-Host "✓ Backup enviado para nuvem!"
Write-Host "================================"
Write-Host ""
Write-Host "Local na nuvem: $NuvemBackupDir"
Write-Host ""
Write-Host "Arquivos na nuvem:"
Get-ChildItem $NuvemBackupDir | ForEach-Object { Write-Host "  ✓ $($_.Name)" }
