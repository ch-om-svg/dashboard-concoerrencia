@echo off
title Atualizacao Diaria e Auditoria - Dashboard Concorrencia
echo ========================================================
echo A INICIAR ROTINA DE AUDITORIA E ATUALIZACAO AUTOMATIZADA
echo ========================================================
cd /d "%~dp0"
node scripts\sync_all_pipeline.js
echo.
pause
