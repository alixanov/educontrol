@echo off
chcp 65001 > nul
title EduControl Launcher
cd /d "%~dp0"

echo =======================================================
echo    EduControl - Ish vaqti hisobi va nazorati
echo    EduControl - Учет и контроль рабочего времени
echo =======================================================
echo.

echo [1/3] Backend (Port 5000) tekshirilmoqda...
netstat -ano | findstr :5000 | findstr LISTENING > nul
if errorlevel 1 (
    echo       Backend ishga tushirilmoqda...
    start /min cmd /c "%~dp0scripts\start_backend.bat"
) else (
    echo       Backend tayyor [OK].
)

echo [2/3] Frontend (Port 3000) tekshirilmoqda...
netstat -ano | findstr :3000 | findstr LISTENING > nul
if errorlevel 1 (
    echo       Frontend ishga tushirilmoqda...
    start /min cmd /c "%~dp0scripts\start_frontend.bat"
) else (
    echo       Frontend tayyor [OK].
)

echo [3/3] EduControl oynasi ochilmoqda...
start "" wscript.exe "%~dp0EduControl.vbs"

echo.
echo =======================================================
echo    EduControl muvaffaqiyatli ishga tushirildi!
echo    EduControl успешно запущен!
echo =======================================================
ping 127.0.0.1 -n 3 > nul
exit