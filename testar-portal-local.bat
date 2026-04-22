@echo off
echo ========================================
echo   Testar Portal Tech Refresh Localmente
echo ========================================
echo.

cd portal

echo [1/3] Verificando node_modules...
if not exist "node_modules" (
    echo Instalando dependencias...
    call npm install
) else (
    echo Dependencias ja instaladas!
)

echo.
echo [2/3] Gerando Prisma Client...
call npx prisma generate

echo.
echo [3/3] Iniciando servidor...
echo.
echo ========================================
echo   Portal rodando em:
echo   http://localhost:3002
echo ========================================
echo.
echo Pressione Ctrl+C para parar o servidor
echo.

call npm start

cd ..
