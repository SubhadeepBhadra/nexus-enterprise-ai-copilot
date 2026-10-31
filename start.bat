@echo off
setlocal
title Nexus Enterprise AI Copilot

echo ======================================================
echo Starting Nexus Enterprise AI Copilot...
echo ======================================================

set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

where node >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Using system Node.js...
    start http://localhost:3000
    node server.js
    goto :eof
)

if exist "C:\Users\Subho\AppData\Local\Programs\Microsoft VS Code\Code.exe" (
    echo Using embedded Node runtime...
    set ELECTRON_RUN_AS_NODE=1
    start http://localhost:3000
    "C:\Users\Subho\AppData\Local\Programs\Microsoft VS Code\Code.exe" server.js
    goto :eof
)

echo No node runtime found in standard paths.
echo Opening index.html directly in default browser...
start "" "%SCRIPT_DIR%index.html"

pause

