@echo off
echo === TESTANDO API DASHBOARD DIRETAMENTE ===
echo.

echo Fazendo requisicao GET para /dashboard...
ssh root@187.127.8.112 "curl -s -H 'x-projeto-id: 1' -H 'Authorization: Bearer SEU_TOKEN' http://localhost:3001/dashboard | jq '.techRefresh'"

echo.
echo === CONCLUIDO ===
pause