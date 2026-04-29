
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
      // URL mais estável da API não-oficial (client=gtx costuma ignorar bloqueios de CORS)
      const url = `https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=${parsedLang}&q=${encodeURIComponent(text)}`

      const audio = document.createElement('audio')
      audio.src = url
      audio.style.display = 'none'
      document.body.appendChild(audio)

      let resolved = false
      const forceResolve = () => {
        if (!resolved) {
          resolved = true
          if (audio.parentNode) {
            audio.parentNode.removeChild(audio)
          }
          resolve()
        }
      }

      audio.onended = forceResolve
      audio.onerror = (e) => {
        console.error('Google TTS error:', e)
        fallbackNativeSpeech(text, parsedLang, forceResolve)
      }

      const playPromise = audio.play()
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.error('Falha ao reproduzir Google TTS:', err)
          fallbackNativeSpeech(text, parsedLang, forceResolve)
        })
      }

      // Timeout geral de segurança para avançar a fila
      setTimeout(forceResolve, 6000)
    })
  },

  speechAll (texts, lang) {
    return speechQueue(this.speech, texts, lang, 0)
  }
}
