@echo off
title Cuentas Claras - APK Simple
setlocal enabledelayedexpansion

set "APK_DIR=%USERPROFILE%\Desktop\CuentasClarasAPK"
set "LOG=%USERPROFILE%\Desktop\cuentas-apk-log.txt"

echo ============================================== > "%LOG%"
echo  Cuentas Claras - Creador de APK Simple >> "%LOG%"
echo ============================================== >> "%LOG%"
echo. >> "%LOG%"

echo Verificando Node.js...
node -v >> "%LOG%" 2>&1
if errorlevel 1 (
    echo ERROR: Node.js no encontrado >> "%LOG%"
    goto error
)

echo Instalando Cordova...
call npm install -g cordova >> "%LOG%" 2>&1
if errorlevel 1 (
    echo ERROR: No se pudo instalar Cordova >> "%LOG%"
    goto error
)

echo Creando proyecto...
if exist "%APK_DIR%" rmdir /s /q "%APK_DIR%"
call cordova create "%APK_DIR%" com.caure.cuentasclaras "Cuentas Claras" >> "%LOG%" 2>&1
if errorlevel 1 (
    echo ERROR: No se pudo crear proyecto >> "%LOG%"
    goto error
)

cd /d "%APK_DIR%"
echo Agregando plataforma Android...
call cordova platform add android >> "%LOG%" 2>&1
if errorlevel 1 (
    echo ERROR: No se pudo agregar plataforma >> "%LOG%"
    goto error
)

echo Configurando para apuntar a tu web...
:: Crear un archivo index.html que redirige a tu web
(
echo ^<meta http-equiv="refresh" content="0; url=https://divisor-cuentas.vercel.app/"^>
echo ^<p^>Redirigiendo a Cuentas Claras...^</p^>
) > www\index.html

echo Configurando permisos...
:: android/app/src/main/res/xml/network_security_config.xml
mkdir platforms\android\app\src\main\res\xml 2>nul
(
echo ^<?xml version="1.0" encoding="utf-8"?^>
echo ^<network-security-config^>
echo   ^<domain-config cleartextTrafficPermitted="true"^>
echo     ^<domain includeSubdomains="true"^>divisor-cuentas.vercel.app^</domain^>
echo   ^</domain-config^>
echo ^</network-security-config^>
) > platforms\android\app\src\main\res\xml\network_security_config.xml

:: Modificar AndroidManifest.xml para agregar config de red
:: (Simplificado - Cordova ya maneja esto)

echo Construyendo APK...
call cordova build android --release >> "%LOG%" 2>&1
if errorlevel 1 (
    echo ERROR: Falló la construcción >> "%LOG%"
    goto error
)

echo.
echo ==============================================
echo APK CREADO EXITOSAMENTE
echo ==============================================
echo.
echo Tu APK está en:
echo %APK_DIR%\platforms\android\app\build\outputs\apk\release\app-release-unsigned.apk
echo.
echo Para subir a GitHub Releases o compartir por WhatsApp
echo Renombra el archivo como: CuentasClaras.apk
echo.
goto end

:error
echo.
echo ==============================================
echo HUBO UN ERROR
echo Revisa: %LOG%
echo ==============================================
echo.

:end
pause >nul
