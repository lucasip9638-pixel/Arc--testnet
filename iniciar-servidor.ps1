Write-Host "========================================" -ForegroundColor Green
Write-Host "  INICIANDO SERVIDOR NEXT.JS" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Servidor sera iniciado em:" -ForegroundColor Yellow
Write-Host "  http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Mantenha esta janela aberta!" -ForegroundColor Yellow
Write-Host "Pressione Ctrl+C para parar o servidor" -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Verificar se a porta 3000 está em uso
$portInUse = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($portInUse) {
    Write-Host "AVISO: Porta 3000 ja esta em uso!" -ForegroundColor Red
    Write-Host "Encerrando processo na porta 3000..." -ForegroundColor Yellow
    $processId = $portInUse.OwningProcess
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

# Iniciar servidor
npm run dev

