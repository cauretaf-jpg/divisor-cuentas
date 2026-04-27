@echo off
title Cuentas Claras - APK Simple
setlocal

set APK_DIR=%USERPROFILE%\Desktop\CuentasClarasAPK
set LOG=%USERPROFILE%\Desktop\cuentas-apk-log.txt

echo Iniciando... > "%LOG%"
echo. >> "%LOG%"

echo Verificando Node.js...
node -v >> "%LOG%" 2>&1
if errorlevel 1 (
  echo ERROR: Node.js no encontrado. >> "%LOG%"
  goto error
)

echo Instalando Cordova...
call npm install -g cordova >> "%LOG%" 2>&1
if errorlevel 1 (
  echo ERROR: No se pudo instalar Cordova. >> "%LOG%"
  goto error
)

echo Creando proyecto...
if exist "%APK_DIR%" rmdir /s /q "%APK_DIR%" >> "%LOG%" 2>&1
call cordova create "%APK_DIR%" com.caure.cuentasclaras "Cuentas Claras" >> "%LOG%" 2>&1
if errorlevel 1 (
  echo ERROR: No se pudo crear proyecto. >> "%LOG%"
  goto error
)

cd /d "%APK_DIR%"

echo Agregando plataforma Android...
call cordova platform add android >> "%LOG%" 2>&1
if errorlevel 1 (
  echo ERROR: No se pudo agregar plataforma. >> "%LOG%"
  goto error
)

echo Configurando web...
echo ^<meta http-equiv="refresh" content="0; url=https://divisor-cuentas.vercel.app/"^> > www\index.html
echo ^<p^>Cargando Cuentas Claras...^</p^> >> www\index.html

echo Construyendo APK...
call cordova build android --release >> "%LOG%" 2>&1
if errorlevel 1 (
  echo ERROR: Fallo la construccion. >> "%LOG%"
  goto error
)

echo.
echo ========================================
echo APK LISTO
echo ========================================
echo Tu APK esta en:
echo %APK_DIR%\platforms\android\app\build\outputs\apk\release\app-release-unsigned.apk
echo.
goto end

:error
echo.
echo ========================================
echo HUBO UN ERROR
echo Revisa: %LOG%
echo ========================================

:end
echo.
echo Presiona cualquier tecla para cerrar.
pause >nul
