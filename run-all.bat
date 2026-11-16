@echo off
echo ===================================================
echo  Starting CivicEcho Full Stack (Backend + Frontend)
echo ===================================================
start "CivicEcho Backend" cmd /c "run-backend.bat"
start "CivicEcho Frontend" cmd /c "run-frontend.bat"
echo Services launched in separate windows!
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:8080/api/issues

