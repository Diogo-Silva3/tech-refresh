@echo off
echo ========================================
echo RESTAURAR BACKUP DO BANCO DE DADOS
echo ========================================
echo.
echo ATENCAO: Isso vai SUBSTITUIR o banco de dados atual!
echo.
echo Backups disponiveis:
echo 1. db_20260419_190228.sql.gz (19 de abril - 19:02)
echo 2. db_20260420_030001.sql.gz (20 de abril - 03:00) [RECOMENDADO]
echo 3. db_20260421_030001.sql.gz (21 de abril - 03:00) [HOJE - COM PROBLEMA]
echo.
set /p ESCOLHA="Escolha o backup (1, 2 ou 3): "

if "%ESCOLHA%"=="1" set BACKUP=db_20260419_190228.sql.gz
if "%ESCOLHA%"=="2" set BACKUP=db_20260420_030001.sql.gz
if "%ESCOLHA%"=="3" set BACKUP=db_20260421_030001.sql.gz

if "%BACKUP%"=="" (
    echo Escolha invalida!
    pause
    exit /b
)

echo.
echo Backup selecionado: %BACKUP%
echo.
set /p CONFIRMA="TEM CERTEZA que deseja restaurar? (S/N): "
if /i not "%CONFIRMA%"=="S" (
    echo Operacao cancelada.
    pause
    exit /b
)

echo.
echo Restaurando backup no VPS...
ssh root@187.127.8.112 "cd /var/backups/sistema && gunzip -c %BACKUP% | psql -U postgres -d inventario_ti"

echo.
echo ========================================
echo Backup restaurado!
echo ========================================
echo.
echo Agora recarregue o dashboard para verificar.
pause
