@echo off
chcp 65001 > nul
title EduControl - Avto-ishga tushirishni o'chirish

echo ========================================================
echo   EduControl: Avto-ishga tushirishni o'chirish
echo   EduControl: Удаление автозапуска
echo ========================================================
echo.

del /f /q "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\*EduControl*.lnk" 2>nul
powershell -Command "Remove-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Run' -Name 'EduControl' -ErrorAction SilentlyContinue" 2>nul
schtasks.exe /delete /tn "EduControl_AutoBoot" /f 2>nul

echo [OK] Avto-ishga tushirish (Startup, Registry, Scheduler) butunlay o'chirildi!
echo [OK] Автозапуск (Startup, Registry, Task Scheduler) полностью удален!
echo.
pause
exit /b
