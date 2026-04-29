
function speechQueue (speech, texts, lang, index) {
  return new Promise((resolve, reject) => {
    if (texts.length === 0 || index >= texts.length) {
      resolve()
      return
    }

    let text = texts[index]
    speech(text, lang).then(() => {
      speechQueue(speech, texts, lang, index + 1)
        .then(resolve)
        .catch(reject)
    }, reject)
  })
}

function fallbackNativeSpeech (text, lang, callback) {
  const msg = new SpeechSynthesisUtterance()
  msg.text = text
  msg.lang = lang
  msg.onerror = (e) => {
    console.error('Native Speech error:', e)
    callback()
  }
  msg.onend = callback
  speechSynthesis.speak(msg)
}

export default {

  speech (text, lang) {
    return new Promise((resolve, reject) => {
      const parsedLang = (lang || 'pt-BR').replace('_', '-').toLowerCase()
      // Uso da API não-oficial do Google Translate para TTS (usada largamente como fallback gratuito)
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${parsedLang}&client=tw-ob&q=${encodeURIComponent(text)}`
      
      const audio = new Audio(url)
      
      let resolved = false
      const forceResolve = () => {
        if (!resolved) {
          resolved = true
          resolve()
        }
      }

      audio.onended = forceResolve
      audio.onerror = (e) => {
        console.error('Google TTS error:', e)
        // Fallback to native SpeechSynthesis if network fails
        fallbackNativeSpeech(text, parsedLang, forceResolve)
      }

      audio.play().catch(err => {
        console.error('Falha ao reproduzir Google TTS:', err)
        fallbackNativeSpeech(text, parsedLang, forceResolve)
      })

      // Timeout geral de segurança para avançar a fila
      setTimeout(forceResolve, 6000)
    })
  },

  speechAll (texts, lang) {
    return speechQueue(this.speech, texts, lang, 0)
  }
}
