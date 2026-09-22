@echo off
chcp 65001 > nul
title EduControl - Avto-ishga tushirishni o'chirish

echo ========================================================
echo   EduControl: Avto-ishga tushirishni o'chirish
echo   EduControl: Удаление автозапуска
echo ========================================================
echo.

del /f /q "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\EduControl.lnk" 2>nul
schtasks.exe /delete /tn "EduControl_AutoBoot" /f 2>nul

echo [OK] Avto-ishga tushirish muvaffaqiyatli olib tashlandi.
echo [OK] Автозапуск успешно удален.
echo.
pause
exit /b
