@echo off
echo Limpando cache do frontend na VPS...
ssh root@187.127.8.112 "rm -rf /var/www/apps/tech-refresh-frontend/* && systemctl restart nginx"
echo.
echo Copiando novos arquivos...
scp -r frontend/dist/* root@187.127.8.112:/var/www/apps/tech-refresh-frontend/
echo.
echo Pronto! Acesse o site em modo anonimo (Ctrl+Shift+N)
pause
