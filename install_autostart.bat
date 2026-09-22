@echo off
chcp 65001 > nul
title EduControl - Avto-ishga tushirishni sozlash

echo ========================================================
echo   EduControl: Tizimni avto-ishga tushirishga o'rnatish
echo   EduControl: Установка автозапуска системы
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/3] Server kompilyatsiyasi tekshirilmoqda...
if not exist "%~dp0server\dist\src\main.js" (
    echo Server yig'ilmoqda (Building server)...
    cd /d "%~dp0server"
    call npm run build
    cd /d "%~dp0"
)

echo [2/3] Klient kompilyatsiyasi tekshirilmoqda...
if not exist "%~dp0client\.next\BUILD_ID" (
    echo Klient yig'ilmoqda (Building client)...
    cd /d "%~dp0client"
    call npm run build
    cd /d "%~dp0"
)

echo [3/3] Windows avto-yuklanishiga o'rnatilmoqda...
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0setup_autostart.ps1"

echo.
pause
exit /b
