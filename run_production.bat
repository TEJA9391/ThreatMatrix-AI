@echo off
title ThreatMatrix AI - Unified Mainnet Server
echo =======================================================================
echo          __  __                     __  ___      __       _      
echo         / /_/ /_  ________  ____ _ / /_/   ^|  _ / /_  __(_)^|/ ^| 
echo        / __/ __ \/ ___/ _ \/ __ `/ __/  ^| ^|  ^|/ / / / / / / / ^| ^| 
echo       / /_/ / / / /  /  __/ /_/ / /_/ /___^| /___/ / /_/ / / / /  ^| ^| 
echo       \__/_/ /_/_/   \___/\__,_/\__/_/   ^|_/   /_/\__,_/_/_/_/   ^|_^| 
echo                                                                      
echo            UNIFIED CYBER THREAT DETECTOR ^& INFRASTRUCTURE CORE
echo =======================================================================
echo.

:: Check if frontend build exists
if not exist "frontend\dist" (
    echo [SYS] React production build assets not found in frontend\dist.
    echo [SYS] Building frontend distribution package first...
    cd frontend
    call npm install
    call npm run build
    cd ..
    echo [SYS] Build complete. Returning to infrastructure root.
    echo.
)

:: Run Flask server which will serve the built React bundle
echo [SYS] Loading local SQLite credentials registry...
echo [SYS] Initializing Socket.io threat feed broadcast...
echo [SYS] Launching Unified Web Service on http://localhost:5001 ...
echo.
cd backend
python app.py
pause
