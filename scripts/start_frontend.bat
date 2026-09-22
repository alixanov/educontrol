@echo off
chcp 65001 > nul
title EduControl Frontend (Port 3000)
cd /d "%~dp0..\client"

if not exist "%~dp0..\logs" mkdir "%~dp0..\logs"

if not exist ".next\BUILD_ID" (
    echo [%date% %time%] Building client... >> "%~dp0..\logs\client.log"
    call npm run build >> "%~dp0..\logs\client.log" 2>&1
)

echo [%date% %time%] Starting EduControl Frontend... >> "%~dp0..\logs\client.log"
call npm run start >> "%~dp0..\logs\client.log" 2>&1

