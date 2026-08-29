# AgriSmart Microservices Health Verification Script

$services = @(
    @{ Name = "User Service"      ; Url = "http://localhost:8081/v3/api-docs" },
    @{ Name = "Farm Service"      ; Url = "http://localhost:8082/v3/api-docs" },
    @{ Name = "Crop Service"      ; Url = "http://localhost:8083/v3/api-docs" },
    @{ Name = "Weather Service"   ; Url = "http://localhost:8084/v3/api-docs" },
    @{ Name = "Analytics Service" ; Url = "http://localhost:8085/v3/api-docs" }
)

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host " Checking AgriSmart Microservice Statuses..." -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

foreach ($svc in $services) {
    try {
        $response = Invoke-WebRequest -Uri $svc.Url -Method Get -TimeoutSec 3 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "[ONLINE] $($svc.Name) is active and running." -ForegroundColor Green
        } else {
            Write-Host "[WARNING] $($svc.Name) returned status code $($response.StatusCode)." -ForegroundColor Yellow
        }
    } catch {
        Write-Host "[OFFLINE] $($svc.Name) is not reachable on $($svc.Url)." -ForegroundColor Red
    }
}

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "Run individual spring boot modules with 'mvn spring-boot:run' to start them." -ForegroundColor Gray
