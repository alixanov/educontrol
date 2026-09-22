@echo off
title Stop EduControl
echo Stopping EduControl services...
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 5000,3000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }" > nul 2>&1
echo [OK] EduControl services stopped.
ping 127.0.0.1 -n 2 > nul
exit /b
