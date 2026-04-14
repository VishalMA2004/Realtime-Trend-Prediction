$root = Split-Path -Parent $PSScriptRoot
$powerShellExe = "C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe"

$backend = Start-Process $powerShellExe -ArgumentList "-NoExit", "-Command", "Set-Location '$root\\backend'; npm run dev" -PassThru
$frontend = Start-Process $powerShellExe -ArgumentList "-NoExit", "-Command", "Set-Location '$root\\frontend'; npm run dev" -PassThru

Write-Host "Backend started with PID $($backend.Id)"
Write-Host "Frontend started with PID $($frontend.Id)"
Write-Host "Close the opened PowerShell windows to stop the dev servers."
