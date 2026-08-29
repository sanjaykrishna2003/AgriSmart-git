# AgriSmart Keep Alive Script
$ErrorActionPreference = "Stop"

# Terminate any existing java processes first
Get-Process -Name java -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "Starting microservices..."
# Run the startup script
. ./run_backend.ps1

Write-Host "Entering keep-alive loop..."
while ($true) {
    Start-Sleep -Seconds 10
}
