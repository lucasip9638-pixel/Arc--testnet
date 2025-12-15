@echo off
chcp 65001 >nul
echo ======================================================================
echo   ATUALIZAR ENDEREÇO DO CONTRATO NO FRONTEND
echo ======================================================================
echo.
set /p CONTRACT_ADDRESS="Cole o endereço do contrato deployado (0x...): "
echo.
echo Atualizando lib/swap-contract.ts...
echo.

powershell -Command "$content = Get-Content 'lib\swap-contract.ts' -Raw; $content = $content -replace 'export const SWAP_CONTRACT_ADDRESS = \"0x[^\"]+\" as `0x\${string}`', ('export const SWAP_CONTRACT_ADDRESS = \"' + '%CONTRACT_ADDRESS%' + '\" as `0x${string}`'); Set-Content 'lib\swap-contract.ts' -Value $content"

if errorlevel 1 (
    echo.
    echo ERRO ao atualizar. Atualize manualmente:
    echo.
    echo Abra lib/swap-contract.ts e substitua:
    echo   export const SWAP_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000" as `0x${string}`
    echo.
    echo Por:
    echo   export const SWAP_CONTRACT_ADDRESS = "%CONTRACT_ADDRESS%" as `0x${string}`
    echo.
) else (
    echo.
    echo ======================================================================
    echo   ✅ FRONTEND ATUALIZADO!
    echo ======================================================================
    echo.
    echo Endereço do contrato atualizado: %CONTRACT_ADDRESS%
    echo.
    echo Próximos passos:
    echo 1. Financie o contrato com USDC e EURC
    echo 2. Teste: npm run dev
    echo.
)

pause

