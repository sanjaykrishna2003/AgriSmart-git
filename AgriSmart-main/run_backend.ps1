# AgriSmart Backend Runner Script
# This script starts all five microservices in the background and logs their console outputs.

$ErrorActionPreference = "Stop"

# Create logs directory
$logDir = Join-Path $PSScriptRoot "logs"
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir | Out-Null
}

$services = @(
    @{ Name = "User Service"      ; Port = 8081 ; Jar = "user-service/target/user-service-1.0.0.jar" },
    @{ Name = "Farm Service"      ; Port = 8082 ; Jar = "farm-service/target/farm-service-1.0.0.jar" },
    @{ Name = "Crop Service"      ; Port = 8083 ; Jar = "crop-service/target/crop-service-1.0.0.jar" },
    @{ Name = "Weather Service"   ; Port = 8084 ; Jar = "weather-service/target/weather-service-1.0.0.jar" },
    @{ Name = "Analytics Service" ; Port = 8085 ; Jar = "analytics-service/target/analytics-service-1.0.0.jar" }
)

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host " Starting AgriSmart Microservices Background..." -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

foreach ($svc in $services) {
    $jarPath = Join-Path $PSScriptRoot $svc.Jar
    if (-not (Test-Path $jarPath)) {
        Write-Error "Could not find build artifact: $jarPath. Please compile with Maven first."
    }

    $logFile = Join-Path $logDir "$($svc.Name.Replace(' ', '')).log"
    $errFile = Join-Path $logDir "$($svc.Name.Replace(' ', ''))_error.log"
    Write-Host "Starting $($svc.Name) on port $($svc.Port)... (Logs: logs/$($svc.Name.Replace(' ', '')).log)" -ForegroundColor Yellow

    # Start the process in background redirecting standard output and error natively
    Start-Process java -ArgumentList "-jar `"$jarPath`"" -RedirectStandardOutput $logFile -RedirectStandardError $errFile -WindowStyle Hidden
}

Write-Host "`nWaiting for all microservices to start and initialize Hibernate/JPA schemas..." -ForegroundColor Cyan

# Poll statuses
$maxRetries = 20
$retryCount = 0
$allOnline = $false

while (-not $allOnline -and $retryCount -lt $maxRetries) {
    Start-Sleep -Seconds 3
    $retryCount++
    $allOnline = $true
    
    Write-Host "`nChecking service status (Check $retryCount/$maxRetries)..." -ForegroundColor Gray
    
    foreach ($svc in $services) {
        $url = "http://localhost:$($svc.Port)/v3/api-docs"
        try {
            $response = Invoke-WebRequest -Uri $url -Method Get -TimeoutSec 2 -UseBasicParsing
            if ($response.StatusCode -eq 200) {
                Write-Host "  [ONLINE] $($svc.Name) is active." -ForegroundColor Green
            } else {
                Write-Host "  [PENDING] $($svc.Name) returned status $($response.StatusCode)." -ForegroundColor Yellow
                $allOnline = $false
            }
        } catch {
            Write-Host "  [OFFLINE] $($svc.Name) is starting up..." -ForegroundColor Red
            $allOnline = $false
        }
    }
}

if ($allOnline) {
    Write-Host "`n=================================================" -ForegroundColor Green
    Write-Host " All microservices are active and ONLINE!" -ForegroundColor Green
    Write-Host "=================================================" -ForegroundColor Green
} else {
    Write-Host "`n=================================================" -ForegroundColor Red
    Write-Host " Some microservices failed to start within timeout." -ForegroundColor Red
    Write-Host " Please check logs in the 'logs/' folder for errors." -ForegroundColor Red
    Write-Host "=================================================" -ForegroundColor Red
}
