# Piper TTS Server para Painel-Web

Este servidor provê uma interface HTTP para o [Piper TTS](https://github.com/rhasspy/piper), permitindo que o painel de senhas utilize vozes naturais e de alta qualidade localmente, sem depender de conexão com a internet ou APIs pagas.

## 1. Instalação rápida (Linux/macOS)

Abra o terminal na pasta raiz do projeto e execute:

```bash
chmod +x piper-server/install.sh
./piper-server/install.sh
python3 piper-server/server.py
```

## 2. Instalação manual (Windows/WSL)

Caso não esteja no Linux ou prefira fazer manualmente:

1. Baixe o binário do Piper para sua plataforma em: [Piper Releases](https://github.com/rhasspy/piper/releases/latest)
2. Baixe o modelo de voz `pt_BR-faber-medium.onnx` e o arquivo `.json` correspondente em: [Piper Voices (Hugging Face)](https://huggingface.co/rhasspy/piper-voices/tree/main/pt/pt_BR/faber/medium)
3. Organize os arquivos nesta estrutura:
```
piper/
  piper.exe          ← binário (ou 'piper' no Linux)
  models/
    pt_BR-faber-medium.onnx
    pt_BR-faber-medium.onnx.json
```

## 3. Variáveis de ambiente

Você pode personalizar o servidor usando as seguintes variáveis:

| Variável | Padrão | Descrição |
|---|---|---|
| `PIPER_BIN` | `./piper/piper` | Caminho para o executável do Piper |
| `PIPER_MODELS_DIR` | `./piper/models` | Pasta onde os modelos .onnx estão salvos |
| `PIPER_PORT` | `5500` | Porta em que o servidor HTTP irá rodar |

## 4. Configurando no painel

Após iniciar o servidor (`python3 piper-server/server.py`):

1. Vá em **Configurações** no painel.
2. Acesse a aba **Som**.
3. Certifique-se de que a opção **Habilitar voz (vocalização)** está marcada.
4. Em **Motor de Voz**, selecione **Piper TTS (Alta Qualidade)**.
5. Clique em **Testar** para validar a conexão.
6. Clique em **Salvar**.

## 5. Rodando como serviço (systemd)

Para que o servidor inicie automaticamente no boot do Linux, você pode criar um arquivo em `/etc/systemd/system/piper-tts.service`:

```ini
[Unit]
Description=Piper TTS Server
After=network.target

[Service]
ExecStart=/usr/bin/python3 /caminho/para/o/projeto/piper-server/server.py
WorkingDirectory=/caminho/para/o/projeto
StandardOutput=inherit
StandardError=inherit
Restart=always
User=seu_usuario

[Install]
WantedBy=multi-user.target
```

## 6. Adicionando outras vozes

O Piper suporta dezenas de idiomas. Para adicionar novas vozes:
1. Baixe os arquivos `.onnx` e `.onnx.json` de [Piper Voices](https://huggingface.co/rhasspy/piper-voices).
2. Coloque-os na pasta `piper/models/`.
3. O servidor detectará automaticamente o novo modelo se o idioma enviado no JSON corresponder ao mapeamento no `server.py`.

## 7. Solução de problemas

- **"Servidor não encontrado"**: Verifique se o processo Python está rodando e se a URL nas configurações está correta (ex: `http://localhost:5500/tts`).
- **"Permission denied"**: No Linux/macOS, execute `chmod +x ./piper/piper` para dar permissão de execução ao binário.
- **Sem som ao chamar**: Os navegadores modernos bloqueiam som automático. É necessário interagir (clicar) em qualquer lugar da página do painel uma vez após carregá-la.
- **Painel em outro computador**: Se o painel estiver rodando em uma máquina e o Piper em outra, substitua `localhost` pelo endereço IP da máquina onde o Piper está rodando.
