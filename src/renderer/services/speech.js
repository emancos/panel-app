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

export default {

  speech (text, lang) {
    return new Promise((resolve, reject) => {
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

      // window.speechSynthesis.cancel() - Removido para permitir que a fila funcione
      window.speechSynthesis.speak(msg)
    })
  },

  speechAll (texts, lang) {
    return speechQueue(this.speech, texts, lang, 0)
  }
}
