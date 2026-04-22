@echo off
echo === Baixando backups da VPS ===

set BACKUP_LOCAL=C:\Temp\wickbold\Backup
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set DATA=%%c%%b%%a)

echo Criando pasta local de backups...
mkdir "%BACKUP_LOCAL%\%DATA%" 2>nul

echo Listando backups disponiveis na VPS...
ssh root@187.127.8.112 "ls -lh /var/backups/sistema/"

echo.
set /p CONFIRMA="Deseja baixar TODOS os backups? (S/N): "
if /i not "%CONFIRMA%"=="S" goto :fim

echo.
echo Baixando backups...
scp root@187.127.8.112:/var/backups/sistema/*.gz "%BACKUP_LOCAL%\%DATA%\"
scp root@187.127.8.112:/var/backups/sistema/*.txt "%BACKUP_LOCAL%\%DATA%\"

echo.
echo === Download concluido! ===
echo Backups salvos em: %BACKUP_LOCAL%\%DATA%
echo.
echo Depois voce pode copiar manualmente para o OneDrive!
echo.
explorer "%BACKUP_LOCAL%\%DATA%"

:fim
pause
