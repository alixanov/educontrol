@echo off
chcp 65001 > nul
title EduControl Server (Port 5000)
cd /d "%~dp0..\server"

if not exist "%~dp0..\logs" mkdir "%~dp0..\logs"

if not exist "dist\src\main.js" (
    echo [%date% %time%] Building server... >> "%~dp0..\logs\server.log"
    call npm run build >> "%~dp0..\logs\server.log" 2>&1
)

echo [%date% %time%] Starting EduControl Backend... >> "%~dp0..\logs\server.log"
node dist\src\main.js >> "%~dp0..\logs\server.log" 2>&1

