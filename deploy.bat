@echo off
echo ========================================================
echo   Google Cloud Deployment Script (Frontend + Backend)
echo ========================================================

REM Check if gcloud is installed
WHERE gcloud >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Google Cloud SDK is NOT installed.
    echo Please install it from: https://cloud.google.com/sdk/docs/install
    echo and then run 'gcloud init' before running this script.
    pause
    exit /b 1
)

echo [INFO] gcloud is installed.

echo.
echo ========================================================
echo   Select Google Cloud Project
echo ========================================================
echo Fetching available projects...
call gcloud projects list
echo.
echo --------------------------------------------------------
echo IMPORTANT: Enter the 'PROJECT_ID' (e.g., my-app-123), 
echo            NOT the 'PROJECT_NUMBER' (e.g., 123456789).
echo --------------------------------------------------------
set /p GCP_PROJECT_ID="Project ID: "

echo.
echo Setting project to %GCP_PROJECT_ID%...
call gcloud config set project %GCP_PROJECT_ID%
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to set project. Please check the ID and try again.
    pause
    exit /b 1
)

REM Deploy Backend
echo.
echo ========================================================
echo   [1/2] Deploying Backend...
echo ========================================================
cd backend
echo Deploying to project: %GCP_PROJECT_ID%
call gcloud run deploy backend-service --source . --port 8000 --allow-unauthenticated --region us-central1 --project %GCP_PROJECT_ID%
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Backend deployment failed.
    echo Please ensure you entered the correct PROJECT_ID (not the number).
    cd ..
    pause
    exit /b 1
)
cd ..
echo [SUCCESS] Backend deployed.

echo.
echo ========================================================
echo IMPORTANT: BACKEND SERVICE URL
echo ========================================================
echo Please look for the Service URL in the output above (e.g., https://backend-service-xyz.a.run.app)
echo You MUST update your frontend source code with this URL before deploying the frontend.
echo.
echo 1. Open frontend/vite.config.js or the API configuration file.
echo 2. Replace 'http://127.0.0.1:8000' or similar with the new Cloud Run URL.
echo.
pause

REM Deploy Frontend
echo.
echo ========================================================
echo   [2/2] Deploying Frontend...
echo ========================================================
cd frontend
echo Deploying to project: %GCP_PROJECT_ID%
call gcloud run deploy frontend-service --source . --port 80 --allow-unauthenticated --region us-central1 --project %GCP_PROJECT_ID%
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Frontend deployment failed.
    cd ..
    pause
    exit /b 1
)
cd ..
echo.
echo ========================================================
echo   [SUCCESS] Deployment Complete!
echo ========================================================
echo.
pause
