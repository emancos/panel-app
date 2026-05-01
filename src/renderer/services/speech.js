export default {
  piperEndpoint: 'http://localhost:5500/tts',
  engine: 'native', // 'native' | 'piper'
  lengthScale: 1.0,
  noiseScale: 0.667,

  configure ({ endpoint, engine, lengthScale, noiseScale }) {
    if (endpoint) this.piperEndpoint = endpoint
    if (engine) this.engine = engine
    if (lengthScale !== undefined) this.lengthScale = lengthScale
    if (noiseScale !== undefined) this.noiseScale = noiseScale
  },

  async speech (text, lang) {
    if (this.engine === 'piper') {
      try {
        return await this._piperSpeech(text, lang)
      } catch (err) {
        console.warn('Piper TTS failed, falling back to native speech:', err)
        return await this._nativeSpeech(text, lang)
      }
    }
    return await this._nativeSpeech(text, lang)
  },

  async speechAll (texts, lang) {
    if (this.engine === 'piper') {
      try {
        // Envia tudo em uma única requisição para melhor prosódia e menor latência.
        // O try/catch envolve TODA a operação — se falhar, nenhum áudio foi reproduzido
        // ainda, então o fallback nativo pode falar a sequência completa sem mistura de vozes.
        const fullText = texts.join(' ')
        await this._piperSpeech(fullText, lang)
        return
      } catch (err) {
        console.warn('Piper failed, falling back to native for the whole sequence:', err)
      }
    }

    // Motor nativo ou fallback: itera em loop para respeitar limites de caracteres da API
    for (const text of texts) {
      await this._nativeSpeech(text, lang)
    }
  },

  async checkPiperAvailable () {
    const healthUrl = this.piperEndpoint.replace('/tts', '/health')
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 2000)

    try {
      const response = await fetch(healthUrl, { signal: controller.signal })
      clearTimeout(timeoutId)
      return response.ok
    } catch (err) {
      clearTimeout(timeoutId)
      return false
    }
  },

  _piperSpeech (text, lang) {
    return new Promise((resolve, reject) => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000)

      const body = JSON.stringify({
        text,
        lang: (lang || 'pt_BR').replace('-', '_'),
        length_scale: this.lengthScale,
        noise_scale: this.noiseScale
      })

      fetch(this.piperEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        signal: controller.signal
      })
        .then(response => {
          clearTimeout(timeoutId)
          if (!response.ok) throw new Error(`HTTP ${response.status}`)
          return response.blob()
        })
        .then(blob => {
          const url = URL.createObjectURL(blob)
          const audio = new Audio(url)

          audio.onended = () => {
            URL.revokeObjectURL(url)
            resolve()
          }

          audio.onerror = () => {
            URL.revokeObjectURL(url)
            reject(new Error('Audio playback error'))
          }

          audio.play().catch(reject)
        })
        .catch(err => {
          clearTimeout(timeoutId)
          reject(err)
        })
    })
  },

  _nativeSpeech (text, lang) {
    return new Promise((resolve) => {
      const parsedLang = (lang || 'pt-BR').replace('_', '-')
      const msg = new SpeechSynthesisUtterance()
      msg.text = text
      msg.lang = parsedLang

      msg.onend = () => {
        resolve()
      }

      msg.onerror = (e) => {
        console.error('Native Speech error:', e)
        // Resolve mesmo com erro para não travar a fila
        resolve()
      }

      window.speechSynthesis.speak(msg)
    })
  }
}
