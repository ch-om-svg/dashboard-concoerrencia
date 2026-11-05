@echo off
cd /d "C:\Antigravity\Dashboard Concorrencia"
echo [RUNNING COMPETITOR DAILY SYNC...]
python update_competitors.py
echo [SYNC FINISHED]
