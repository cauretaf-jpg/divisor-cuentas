@echo off
setlocal enabledelayedexpansion
title Cuentas Claras - Build Android

set "APP_DIR=%USERPROFILE%\Desktop\CuentasClarasAndroid"
set "LOG_FILE=%USERPROFILE%\Desktop\cuentas-claras-build-log.txt"

echo ===============================================
echo  Cuentas Claras - Generador Android
echo ===============================================
echo.
echo Este script NO se cerrara solo.
echo Log: %LOG_FILE%
echo.
echo Iniciando... > "%LOG_FILE%"

echo Verificando Node.js...
node -v >> "%LOG_FILE%" 2>&1
if errorlevel 1 (
    echo ERROR: Node.js no esta disponible.
    echo ERROR: Node.js no esta disponible. >> "%LOG_FILE%"
    goto end
)

echo Verificando npm...
call npm -v >> "%LOG_FILE%" 2>&1
if errorlevel 1 (
    echo ERROR: npm no esta disponible.
    echo ERROR: npm no esta disponible. >> "%LOG_FILE%"
    goto end
)

echo Verificando Java...
java -version >> "%LOG_FILE%" 2>&1
if errorlevel 1 (
    echo ERROR: Java/JDK 17 no esta instalado o no esta en PATH.
    echo Descarga e instala JDK 17 desde: https://adoptium.net/temurin/releases/?version=17
    echo ERROR: Java/JDK 17 no esta instalado o no esta en PATH. >> "%LOG_FILE%"
    goto end
)

echo Preparando carpeta: %APP_DIR%
if exist "%APP_DIR%" rmdir /s /q "%APP_DIR%" >> "%LOG_FILE%" 2>&1
mkdir "%APP_DIR%" >> "%LOG_FILE%" 2>&1
cd /d "%APP_DIR%"

echo.
echo Ahora se abrira Bubblewrap. Si pregunta por el JDK, responde: No
echo Para el resto, puedes presionar Enter o usar:
echo Project ID: cuentasclaras
echo App name: Cuentas Claras
echo.
echo Ejecutando init... esto puede tardar.
call npx @bubblewrap/cli init --manifest https://divisor-cuentas.vercel.app/manifest.json
if errorlevel 1 (
    echo ERROR: Fallo bubblewrap init. Revisa el log en el Escritorio.
    echo ERROR: Fallo bubblewrap init. >> "%LOG_FILE%"
    goto end
)

echo.
echo Generando AAB/APK...
call npx bubblewrap build
if errorlevel 1 (
    echo ERROR: Fallo bubblewrap build. Revisa el log en el Escritorio.
    echo ERROR: Fallo bubblewrap build. >> "%LOG_FILE%"
    goto end
)

echo.
echo ===============================================
echo LISTO.
echo Busca el archivo .aab o .apk en:
echo %APP_DIR%
echo Log completo:
echo %LOG_FILE%
echo ===============================================

:end
echo.
echo Presiona cualquier tecla para cerrar.
pause >nul
