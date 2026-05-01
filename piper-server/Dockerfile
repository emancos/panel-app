FROM python:3.11-slim-bookworm

# Instalar dependências para download e execução do Piper
RUN apt-get update && apt-get install -y \
    curl \
    xz-utils \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copia o servidor e arquivos necessários
COPY server.py .
COPY install.sh .

# Cria a estrutura de pastas e executa a instalação (download do binário e modelo)
RUN mkdir -p piper/models && \
    chmod +x install.sh && \
    # Modificamos levemente o comportamento do install.sh para rodar sem interação e baixar na pasta certa
    ./install.sh

# Garante que as variáveis de ambiente apontem para os caminhos corretos no container
ENV PIPER_BIN=/app/piper/piper
ENV PIPER_MODELS_DIR=/app/piper/models
ENV PIPER_PORT=5500

EXPOSE 5500

CMD ["python3", "server.py"]
