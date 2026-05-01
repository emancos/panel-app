# Piper TTS Installer for Windows (PowerShell)

$ErrorActionPreference = "Stop"

$PiperDir = ".\piper"
$ModelsDir = "$PiperDir\models"
$PiperVersion = "1.2.0"

Write-Host "=== Piper TTS Installer for Windows ===" -ForegroundColor Cyan

# 1. Verificar Arquitetura
$Arch = $env:PROCESSOR_ARCHITECTURE
if ($Arch -ne "AMD64") {
    Write-Error "Apenas arquitetura x64 (AMD64) é suportada nativamente no Windows por este script."
}

$DownloadUrl = "https://github.com/rhasspy/piper/releases/latest/download/piper_windows_amd64.zip"

Write-Host "Criando pastas..."
if (!(Test-Path $PiperDir)) { New-Item -ItemType Directory -Path $PiperDir | Out-Null }
if (!(Test-Path $ModelsDir)) { New-Item -ItemType Directory -Path $ModelsDir | Out-Null }

# 2. Download e Extração do Piper
Write-Host "Baixando Piper..." -ForegroundColor Yellow
$TempFile = "piper.zip"
Invoke-WebRequest -Uri $DownloadUrl -OutFile $TempFile

Write-Host "Extraindo Piper..." -ForegroundColor Yellow
Expand-Archive -Path $TempFile -DestinationPath $PiperDir -Force
Remove-Item $TempFile

# 3. Download do modelo pt_BR-faber-medium
Write-Host "Baixando modelo de voz (PT-BR Faber)..." -ForegroundColor Yellow
$ModelUrl = "https://huggingface.co/rhasspy/piper-voices/resolve/main/pt/pt_BR/faber/medium/pt_BR-faber-medium.onnx"
$ConfigUrl = "https://huggingface.co/rhasspy/piper-voices/resolve/main/pt/pt_BR/faber/medium/pt_BR-faber-medium.onnx.json"

Invoke-WebRequest -Uri $ModelUrl -OutFile "$ModelsDir\pt_BR-faber-medium.onnx"
Invoke-WebRequest -Uri $ConfigUrl -OutFile "$ModelsDir\pt_BR-faber-medium.onnx.json"

Write-Host "=== Instalação concluída! ===" -ForegroundColor Green
Write-Host "Para rodar o servidor no Windows:"
Write-Host "python piper-server/server.py"
