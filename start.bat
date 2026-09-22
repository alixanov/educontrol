@echo off
echo =======================================================
echo     EduControl - AI Video Surveillance Attendance
echo =======================================================
echo.
echo Starting NestJS Backend (Port 5000)...
start "EduControl Backend" cmd /k "cd server && npm run start"

timeout /t 3 /nobreak >nul

echo Starting Next.js Frontend (Port 3000)...
start "EduControl Frontend" cmd /k "cd client && npm run dev"

echo.
echo =======================================================
echo Both services are booting!
echo Admin Portal: http://localhost:3000
echo Default Login: admin@educontrol.com / admin123
echo Backend API:  http://localhost:5000
echo =======================================================
