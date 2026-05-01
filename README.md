# 🚀 Novo SGA - Painel Web Modernizado

![Version](https://img.shields.io/badge/version-2.1.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Electron](https://img.shields.io/badge/Electron-41.3-47848F.svg)
![Vue](https://img.shields.io/badge/Vue-3.5-4FC08D.svg)

Uma versão modernizada, elegante e robusta do Painel Web para o ecossistema **Novo SGA**. Esta versão foi otimizada para oferecer uma experiência visual premium, suporte a conteúdos multimídia e alta compatibilidade em ambientes modernos.

---

## ✨ Principais Funcionalidades

*   **🎨 Layout Híbrido & Moderno**: Interface redesenhada com tipografia *Outfit*, efeitos de *glassmorphism* e animações suaves.
*   **📺 Integração com YouTube**: Suporte nativo para vídeos individuais ou playlists completas como plano de fundo, com correções para ambiente de produção.
*   **🎙️ Vocalização Natural (Piper TTS)**: Integração com o motor Piper para chamadas de senha com vozes naturais locais (offline), incluindo controle de velocidade e entonação. Fallback automático para a Web Speech API.
*   **🖼️ Logo Personalizada**: Upload direto via painel de configurações com persistência local (Base64).
*   **🔊 Controle de Áudio Inteligente**: Gestão de volume exclusiva para o vídeo, com pausa e mute automáticos durante a chamada de senhas.
*   **🐧 Linux Optimized**: Correções integradas para drivers de vídeo e sandbox no Electron em distros modernas (Ubuntu 22+, Debian, etc).

---

## 🚀 Como Começar

### Pré-requisitos
*   Node.js (v20 ou superior)
*   Python 3 (para o servidor Piper TTS)

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/emancos/panel-app.git
cd panel-app
```

2. Instale as dependências do painel:
```bash
npm install
```

3. Configure o servidor de voz Piper:
```bash
chmod +x piper-server/install.sh
./piper-server/install.sh
```

### Modos de Execução

#### 🎙️ Servidor de Voz (Necessário para Piper TTS)
```bash
python3 piper-server/server.py
```

#### 🛠️ Desenvolvimento
```bash
npm run dev
```

#### 🌐 Versão Web (Produção)
Gera os arquivos estáticos na pasta `dist/web`.
```bash
npm run build:web
```

#### 📦 Versão Desktop (Electron)
Gera o AppImage/Executável na pasta `build`.
```bash
npm run build
```

---

## 🐳 Docker & Compose

Para rodar o ecossistema completo (Painel + Voz Piper) de forma rápida:

```bash
# Iniciar todos os serviços
docker-compose up -d --build
```

-   **Painel Web**: `http://localhost:8080`
-   **Servidor Piper**: `http://localhost:5500/health`

Para rodar apenas o painel via Docker simples:
```bash
docker build -t novosga-painel .
docker run -d -p 8080:80 --name painel-web novosga-painel
```

---

## ⚙️ Configurações Importantes

### Piper TTS (Voz de Alta Qualidade)
Para usar vozes naturais, ative o Piper TTS em **Configurações > Som**. Você pode ajustar a velocidade e a expressividade da voz diretamente na interface. Certifique-se de que o `server.py` está rodando.

### YouTube no Electron
Esta versão inclui correções automáticas de headers e políticas de segurança para garantir que o embed do YouTube funcione perfeitamente tanto em modo desenvolvimento quanto em produção (`file://`).

---

## 🛠️ Tecnologias Utilizadas

*   **Vue.js 3.5** - Framework principal
*   **Vuex 4** - Gestão de estado
*   **Electron 41** - Distribuição desktop
*   **Bulma 1.0** - Framework CSS
*   **Sass** - Pré-processador CSS
*   **Piper TTS** - Engine de voz natural local

---

## 📄 Licença
Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---
Desenvolvido com ❤️ para a comunidade **Novo SGA**.
