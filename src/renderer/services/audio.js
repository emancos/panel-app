let currentAudio = null

export default {

  alertPath: 'static/sound',

  alertsAvailable: {
    'Default': 'ekiga-vm.wav',
    'Airport Bingbong': 'airport-bingbong.wav',
    'Ding dong': 'ding-dong.wav',
    'Doorbell Bingbong': 'doorbell-bingbong.wav',
    'Info bleep': 'infobleep.wav',
    'Quito Mariscal sucre': 'quito-mariscal-sucre.wav',
    'Toy doorbell': 'toydoorbell.wav'
  },
  playAlert (filename) {
    return new Promise((resolve, reject) => {
      filename = filename || this.alertsAvailable.Default

      if (!currentAudio) {
        currentAudio = new Audio()
        document.body.appendChild(currentAudio)
      } else {
        currentAudio.pause()
        currentAudio.onended = null
        currentAudio.onerror = null
      }

      currentAudio.src = `${this.alertPath}/alert/${filename}`
      currentAudio.onended = resolve
      currentAudio.onerror = (e) => {
        console.error('Erro no áudio:', e)
        reject(e)
      }

      const playPromise = currentAudio.play()
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          console.warn('Audio blocked by browser policy ou interrompido:', e)
          reject(e)
        })
      }
    })
  }
}
