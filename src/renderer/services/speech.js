
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
      const msg = new SpeechSynthesisUtterance()
      msg.text = text
      msg.lang = (lang || '').replace('_', '-').toLowerCase()

      let resolved = false
      const forceResolve = () => {
        if (!resolved) {
          resolved = true
          resolve()
        }
      }

      msg.onerror = (e) => {
        console.error('Speech error:', e)
        forceResolve() // fallback to continue queue
      }
      msg.onend = forceResolve

      speechSynthesis.speak(msg)

      // Fallback timeout: se a voz travar e não disparar onend em 5 segundos, forçamos.
      setTimeout(forceResolve, 5000)
    })
  },

  speechAll (texts, lang) {
    return speechQueue(this.speech, texts, lang, 0)
  }
}
