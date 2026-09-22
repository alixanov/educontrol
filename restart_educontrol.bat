@echo off
chcp 65001 > nul
title EduControl - Qayta ishga tushirish (Перезапуск)

echo ========================================================
echo   EduControl: Tizim qayta ishga tushirilmoqda...
echo   EduControl: Перезапуск системы...
echo ========================================================

call "%~dp0stop_educontrol.bat"
ping 127.0.0.1 -n 2 > nul
start "" wscript.exe "%~dp0EduControl.vbs"
exit /b
