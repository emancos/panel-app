# 🚀 Novo SGA - Painel Web Modernizado

![Version](https://img.shields.io/badge/version-2.1.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Electron](https://img.shields.io/badge/Electron-7.2.4-47848F.svg)
![Vue](https://img.shields.io/badge/Vue-2.7-4FC08D.svg)

Uma versão modernizada, elegante e robusta do Painel Web para o ecossistema **Novo SGA**. Esta versão foi otimizada para oferecer uma experiência visual premium, suporte a conteúdos multimídia e alta compatibilidade em ambientes Linux e Docker.

---

## ✨ Principais Funcionalidades

*   **🎨 Layout Híbrido & Moderno**: Interface redesenhada com tipografia *Outfit*, efeitos de *glassmorphism* e animações suaves.
*   **📺 Integração com YouTube**: Suporte nativo para vídeos individuais ou playlists completas como plano de fundo.
*   **🎙️ Vocalização Avançada (TTS)**: Suporte ao **Piper TTS** para vozes naturais de alta fidelidade processadas localmente (offline), com fallback automático para a Web Speech API.
*   **🖼️ Logo Personalizada**: Upload direto via painel de configurações com persistência local (Base64).
*   **🔊 Controle de Áudio Inteligente**: Gestão de volume exclusiva para o vídeo, com pausa automática durante a chamada de senhas.
*   **🐳 Docker Ready**: Dockerfile otimizado para implantação rápida via Nginx.
*   **🐧 Linux Optimized**: Correções integradas para drivers de vídeo e sandbox no Electron em distros modernas (Ubuntu 22+, Debian, etc).

---

## 🚀 Como Começar

### Pré-requisitos
*   Node.js (recomendado v12 ou v16 para compatibilidade de build)
*   npm

### Instalação
```bash
# Clone o repositório
git clone https://github.com/emancos/panel-app.git

# Entre na pasta
cd panel-app

# Instale as dependências
npm install
```

### Modos de Execução

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

## 🐳 Docker

Para rodar o painel de forma rápida e isolada usando Docker:

```bash
# Construir a imagem
docker build -t novosga-painel .

# Rodar o container na porta 8080
docker run -d -p 8080:80 --name painel-web novosga-painel
```
Acesse em: `http://localhost:8080`

---

## ⚙️ Configurações Importantes

### YouTube no Electron
Se o player do YouTube exibir "Erro de configuração" ou "Assistir no YouTube", certifique-se de que o aplicativo foi compilado com as correções de **Spoofing de Headers** presentes nesta versão, que permitem o funcionamento do embed sob o protocolo `file://`.

### Vocalização
Esta versão suporta o motor **Piper TTS**, que permite vocalização de alta qualidade sem internet. O servidor Piper deve estar rodando localmente (veja a pasta `piper-server/`). Caso o Piper não esteja disponível ou ocorra um erro, o painel alterna silenciosamente para a voz nativa do navegador.

---

## 🛠️ Tecnologias Utilizadas

*   **Vue.js 2.7** - Framework principal
*   **Vuex** - Gestão de estado
*   **Electron** - Distribuição desktop
*   **Bulma** - Framework CSS
*   **Sass** - Pré-processador CSS
*   **Piper TTS** - Engine de vocalização natural local

---

## 📄 Licença
Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---
Desenvolvido com ❤️ para a comunidade **Novo SGA**.
