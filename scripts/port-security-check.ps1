# PORT SECURITY CHECK SCRIPT
# Only allows Port 5000

Write-Host "Port Security Check Starting..." -ForegroundColor Yellow

$ALLOWED_PORT = 5000
$FORBIDDEN_PORTS = @(3000, 4173, 8080, 3001, 8000, 9000, 4000, 3030)
$violations = 0

# Check forbidden ports
Write-Host "Checking forbidden ports..." -ForegroundColor Cyan
foreach ($port in $FORBIDDEN_PORTS) {
    $process = netstat -ano | findstr ":$port "
    if ($process) {
        Write-Host "FORBIDDEN PORT DETECTED: $port" -ForegroundColor Red
        $violations++
        
        $lines = $process -split "`n"
        foreach ($line in $lines) {
            if ($line -match "LISTENING\s+(\d+)") {
                $pid = $matches[1]
                Write-Host "Stopping PID $pid..." -ForegroundColor Yellow
                try {
                    Stop-Process -Id $pid -Force -ErrorAction Stop
                    Write-Host "PID $pid stopped successfully" -ForegroundColor Green
                } catch {
                    Write-Host "Failed to stop PID $pid" -ForegroundColor Red
                }
            }
        }
    }
}

# Check allowed port
Write-Host "Checking allowed port..." -ForegroundColor Cyan
$allowedProcess = netstat -ano | findstr ":$ALLOWED_PORT "
if ($allowedProcess) {
    Write-Host "Port $ALLOWED_PORT is active - ALLOWED" -ForegroundColor Green
} else {
    Write-Host "Port $ALLOWED_PORT is free - Normal" -ForegroundColor Blue
}

# Security report
Write-Host "SECURITY REPORT" -ForegroundColor Magenta
Write-Host "===============" -ForegroundColor Magenta
if ($violations -eq 0) {
    Write-Host "ALL CHECKS PASSED" -ForegroundColor Green
    Write-Host "Only Port $ALLOWED_PORT is allowed" -ForegroundColor Green
    exit 0
} else {
    Write-Host "$violations SECURITY VIOLATIONS DETECTED" -ForegroundColor Red
    Write-Host "Forbidden ports have been closed" -ForegroundColor Yellow
    exit 1
}