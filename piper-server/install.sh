#!/bin/bash

set -e

PIPER_DIR="./piper"
MODELS_DIR="$PIPER_DIR/models"
PIPER_VERSION="1.2.0"

echo "=== Piper TTS Installer ==="

# 1. Detectar SO/Arquitetura
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

if [[ "$OS" == "linux" ]]; then
    if [[ "$ARCH" == "x86_64" ]]; then
        PLATFORM="amd64"
    elif [[ "$ARCH" == "aarch64" || "$ARCH" == "arm64" ]]; then
        PLATFORM="arm64"
    else
        echo "Arquitetura não suportada: $ARCH"
        exit 1
    fi
elif [[ "$OS" == "darwin" ]]; then
    PLATFORM="macos"
else
    echo "SO não suportado: $OS"
    exit 1
fi

DOWNLOAD_URL="https://github.com/rhasspy/piper/releases/latest/download/piper_${OS}_${ARCH}.tar.gz"

# No GitHub as releases as vezes usam nomes diferentes para a plataforma
# Vamos tentar detectar o arquivo correto na release mais recente
echo "Detectando download para $OS $ARCH..."

mkdir -p "$PIPER_DIR"
mkdir -p "$MODELS_DIR"

# 2. Download e extração do Piper
echo "Baixando Piper..."
curl -L "$DOWNLOAD_URL" -o piper.tar.gz
tar -xzf piper.tar.gz -C "$PIPER_DIR" --strip-components=1
rm piper.tar.gz
chmod +x "$PIPER_DIR/piper"

# 3. Download do modelo pt_BR-faber-medium
echo "Baixando modelo de voz (PT-BR Faber)..."
VOICE_URL="https://huggingface.co/rhasspy/piper-voices/resolve/main/pt/pt_BR/faber/medium/pt_BR-faber-medium.onnx"
VOICE_CONFIG_URL="https://huggingface.co/rhasspy/piper-voices/resolve/main/pt/pt_BR/faber/medium/pt_BR-faber-medium.onnx.json"

curl -L "$VOICE_URL" -o "$MODELS_DIR/pt_BR-faber-medium.onnx"
curl -L "$VOICE_CONFIG_URL" -o "$MODELS_DIR/pt_BR-faber-medium.onnx.json"

# 4. Teste
echo "Testando instalação..."
echo "Olá, o Piper está funcionando corretamente." | "$PIPER_DIR/piper" --model "$MODELS_DIR/pt_BR-faber-medium.onnx" --output_file /tmp/piper_test.wav

if [ -f /tmp/piper_test.wav ]; then
    echo "Teste concluído com sucesso! Áudio gerado em /tmp/piper_test.wav"
else
    echo "Falha no teste: áudio não foi gerado."
    exit 1
fi

# 5. Instruções finais
echo ""
echo "=== Instalação Concluída ==="
echo "Para iniciar o servidor, execute:"
echo "python3 piper-server/server.py"
echo ""
echo "O servidor ouvirá na porta 5500 por padrão."
