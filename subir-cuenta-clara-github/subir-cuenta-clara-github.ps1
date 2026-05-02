$ErrorActionPreference = "Stop"

$ProjectDir = "C:\Users\caure\Desktop\Paginas\Cuentas"

Write-Host "=========================================="
Write-Host "Cuenta Clara - Subir cambios a GitHub"
Write-Host "=========================================="
Write-Host ""

Set-Location $ProjectDir

Write-Host "Estado actual:"
git status --short
Write-Host ""

$CommitMsg = Read-Host "Mensaje del commit"
if ([string]::IsNullOrWhiteSpace($CommitMsg)) {
    $CommitMsg = "Actualiza Cuenta Clara"
}

git add -A

$pending = git diff --cached --name-only
if ([string]::IsNullOrWhiteSpace($pending)) {
    Write-Host ""
    Write-Host "No hay cambios nuevos para subir."
    pause
    exit 0
}

git commit -m $CommitMsg
git push

Write-Host ""
Write-Host "Listo. Cambios subidos a GitHub."
Write-Host "Vercel deberia desplegar automaticamente."
pause
