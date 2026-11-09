@echo off
title Atualizacao Semanal e Auditoria - Benchmark
echo ========================================================
echo A INICIAR ROTINA DE AUDITORIA E ATUALIZACAO SEMANAL
echo ========================================================
cd /d "%~dp0"
node scripts\sync_all_pipeline.js
echo.
echo Concluido!
pause
