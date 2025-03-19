@echo off
echo Backend başlatılıyor...
cd %~dp0
python -m uvicorn app.api.api:app --reload --host 0.0.0.0 --port 8000 