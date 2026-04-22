# Script para configurar autenticação GitHub com navegador
# Quando git pedir credenciais, abre o navegador automaticamente

# 1. Instalar GitHub CLI (se não tiver)
Write-Host "Verificando GitHub CLI..." -ForegroundColor Cyan
$ghInstalled = gh --version 2>$null
if (-not $ghInstalled) {
    Write-Host "Instalando GitHub CLI..." -ForegroundColor Yellow
    winget install GitHub.cli
}

# 2. Fazer login no GitHub (abre navegador automaticamente)
Write-Host "Autenticando no GitHub..." -ForegroundColor Cyan
gh auth login --web

# 3. Configurar Git para usar GitHub CLI como credential helper
Write-Host "Configurando Git..." -ForegroundColor Cyan
git config --global credential.helper gh

# 4. Testar autenticação
Write-Host "Testando autenticação..." -ForegroundColor Cyan
gh auth status

Write-Host "Autenticacao configurada com sucesso!" -ForegroundColor Green
Write-Host "Agora quando git pedir credenciais, usará a autenticação do GitHub CLI" -ForegroundColor Green
