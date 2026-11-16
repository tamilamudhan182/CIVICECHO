@echo off
title CivicEcho - Spring Boot Backend
set "JAVA_HOME=C:\Program Files\Java\jdk-24"
set "PATH=%JAVA_HOME%\bin;%PATH%"
echo ===================================================
echo  Starting CivicEcho Spring Boot Backend (Port 8080)
echo ===================================================
java -jar backend\target\civic-echo-backend-1.0.0.jar
pause

