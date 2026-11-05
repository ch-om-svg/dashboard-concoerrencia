@echo off
title Enviar Dashboard para GitHub
echo ========================================================
echo A enviar Dashboard para o GitHub (ch-om-svg)...
echo ========================================================
cd /d "%~dp0"
git push -u origin main
echo.
if %ERRORLEVEL% equ 0 (
    echo ========================================================
    echo SUCESSO! O projeto foi enviado com sucesso para o GitHub!
    echo ========================================================
) else (
    echo Ocorreu um erro no envio. Verifique as credenciais.
)
echo.
pause
