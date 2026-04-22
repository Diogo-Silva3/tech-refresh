@echo off
echo === Instalando script de backup na VPS ===

echo 1. Enviando script para VPS...
scp backup-completo.sh root@187.127.8.112:/usr/local/bin/backup-completo.sh

echo 2. Dando permissao de execucao...
ssh root@187.127.8.112 "chmod +x /usr/local/bin/backup-completo.sh"

echo 3. Testando backup manual...
ssh root@187.127.8.112 "/usr/local/bin/backup-completo.sh"

echo 4. Configurando cron para backup automatico diario as 3h...
ssh root@187.127.8.112 "(crontab -l 2>/dev/null | grep -v backup-completo; echo '0 3 * * * /usr/local/bin/backup-completo.sh >> /var/log/backup-completo.log 2>&1') | crontab -"

echo.
echo === Instalacao concluida! ===
echo.
echo Backup automatico configurado para rodar todo dia as 3h da manha
echo Logs salvos em: /var/log/backup-completo.log
echo Backups salvos em: /var/backups/sistema/
echo.
echo Para executar backup manual: ssh root@187.127.8.112 "/usr/local/bin/backup-completo.sh"
echo.
pause
