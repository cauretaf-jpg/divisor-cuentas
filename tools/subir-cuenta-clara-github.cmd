@echo off
setlocal EnableExtensions

title Subir Cuenta Clara a GitHub

echo ==========================================
echo Cuenta Clara - Subir cambios a GitHub
echo ==========================================
echo.

set "PROJECT_DIR=C:\Users\caure\Desktop\Paginas\Cuentas"

echo Carpeta del proyecto:
echo %PROJECT_DIR%
echo.

pushd "%PROJECT_DIR%"
if errorlevel 1 (
    echo ERROR: No se pudo entrar a la carpeta del proyecto.
    echo Revisa que exista esta ruta:
    echo %PROJECT_DIR%
    echo.
    pause
    exit /b 1
)

where git >nul 2>nul
if errorlevel 1 (
    echo ERROR: Git no esta instalado o no esta disponible.
    echo.
    pause
    exit /b 1
)

git rev-parse --is-inside-work-tree >nul 2>nul
if errorlevel 1 (
    echo ERROR: Esta carpeta no parece ser un repositorio Git.
    echo.
    pause
    exit /b 1
)

echo Estado actual:
echo ------------------------------------------
git status --short
echo ------------------------------------------
echo.

set /p COMMIT_MSG=Mensaje del commit: 

if "%COMMIT_MSG%"=="" (
    set "COMMIT_MSG=Actualiza Cuenta Clara"
)

echo.
echo Agregando cambios...
git add -A
if errorlevel 1 (
    echo ERROR: Fallo git add.
    echo.
    pause
    exit /b 1
)

git diff --cached --quiet
if not errorlevel 1 (
    echo.
    echo No hay cambios nuevos para subir.
    echo.
    popd
    pause
    exit /b 0
)

echo.
echo Creando commit...
git commit -m "%COMMIT_MSG%"
if errorlevel 1 (
    echo.
    echo ERROR: Fallo git commit.
    echo.
    pause
    exit /b 1
)

echo.
echo Subiendo a GitHub...
git push
if errorlevel 1 (
    echo.
    echo ERROR: Fallo git push.
    echo.
    pause
    exit /b 1
)

echo.
echo ==========================================
echo Listo. Cambios subidos a GitHub.
echo Vercel deberia desplegar automaticamente.
echo ==========================================
echo.

popd
pause
exit /b 0
