@echo off
chcp 65001 > nul
title EduControl Launcher
cd /d "%~dp0"
start "" wscript.exe "%~dp0EduControl.vbs"
exit /b
