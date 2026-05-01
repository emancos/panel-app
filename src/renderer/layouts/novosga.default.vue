<template>
  <div class="novosga-default layout-content" :style="{ 'background-color': color('pageBgColor'), 'color': color('pageFontColor') }">
    <div class="columns is-gapless">
      <div class="column is-multiline featured-column" :class="{ 'is-hybrid': isHybrid }">
        <div class="video-container" v-show="isHybrid">
          <iframe ref="youtubeIframe" :src="youtubeUrl" @load="onIframeLoad" frameborder="0" allow="autoplay; encrypted-media"></iframe>
        </div>

        <header class="ticket-header" v-show="!hasVideo || !showingVideo || isHybrid">
          <featured :message="lastMessage" v-if="lastMessage" :fontColor="color('featuredFontColor', 'pageFontColor')"></featured>
        </header>

        <footer class="ticket-footer" :style="{ 'background-color': color('footerBgColor'), 'color': color('footerFontColor') }">
          <img :src="logoUrl" class="logo">
          <h1 class="footer-text" v-if="config.themeOptions && config.themeOptions.footerText" :style="{ 'color': color('footerFontColor') }">
            {{ config.themeOptions.footerText }}
          </h1>
        </footer>
      </div>
      <div class="column is-one-quarter history-column" :style="{ 'background-color': color('sidebarBgColor'), 'color': color('sidebarFontColor') }">
        <header>
          <h2 class="title" :style="{ 'color': color('sidebarFontColor') }">
            {{ $trans('history.title') }}
          </h2>
          <history
            v-if="lastMessage"
            :messages="messages"
            :fontColorNormal="config.historyFontColorNormal || config.sidebarFontColorNormal"
            :fontColorPriority="config.historyFontColorPriority || config.sidebarFontColorPriority">
          </history>
        </header>
        <footer :style="{ 'background-color': color('clockBgColor'), 'color': color('clockFontColor') }">
          <clock :locale="config.locale" :dateFormat="$trans('date_format')" :fontColor="color('clockFontColor')"></clock>
        </footer>
      </div>
    </div>
  </div>
</template>

<script>
  import Clock from '@/components/Clock.vue'
  import Featured from '@/components/Featured.vue'
  import History from '@/components/History.vue'
  import audio from '@/services/audio'
  import speech from '@/services/speech'

  export default {
    name: 'Default',
    components: {
      Clock,
      Featured,
      History
    },
    data () {
      return {
        isCalling: false,
        showingVideo: true,
        lastMessage: {},
        messageQueue: []
      }
    },
    computed: {
      messages () {
        return this.$store.getters.history
      },
      message () {
        return this.$store.getters.message
      },
      config () {
        return this.$store.state.config
      },
      logoUrl () {
        return this.config.customLogo || (this.config.themeOptions && this.config.themeOptions.logo) || 'static/images/logo.png'
      },
      youtubeUrl () {
        if (!this.config.youtubeUrls || this.config.youtubeUrls.length === 0) return ''
        const validUrls = this.config.youtubeUrls.filter(u => u.id)
        if (validUrls.length === 0) return ''

        const first = validUrls[0]
        const isList = first.isPlaylist
        const vol = this.config.youtubeVolume !== undefined ? this.config.youtubeVolume : 0
        const mute = vol === 0 ? 1 : 0
        const controls = this.config.youtubeControls ? 1 : 0

        let url = `https://www.youtube.com/embed/`
        if (isList) {
          url += `videoseries?list=${first.id}`
        } else {
          url += `${first.id}?rel=0`
        }
        const isFileProtocol = !window.location.origin || window.location.origin === 'null' || window.location.origin.startsWith('file')
        const origin = isFileProtocol ? 'https://www.youtube.com' : window.location.origin
        url += `&enablejsapi=1&autoplay=1&mute=${mute}&controls=${controls}&loop=1&origin=${origin}`

        if (!isList) {
          const others = validUrls.slice(1).map(u => u.id).filter(id => !id.startsWith('PL'))
          if (others.length > 0) {
            url += `&playlist=${others.join(',')}`
          } else {
            url += `&playlist=${first.id}`
          }
        }

        return url
      },
      hasVideo () {
        return !!this.youtubeUrl
      },
      isHybrid () {
        return this.hasVideo && this.showingVideo
      }
    },
    methods: {
      call () {
        this.messageQueue.push(this.message)
        if (!this.isCalling) {
          this.playAudio()
        }
      },
      applyYoutubeVolume () {
        if (!this.$refs.youtubeIframe) return
        // Garante que o volume seja um número entre 0 e 100
        let vol = parseInt(this.config.youtubeVolume)
        if (isNaN(vol)) {
          vol = (this.config.youtubeVolume !== undefined) ? parseInt(this.config.youtubeVolume) : 0
        }
        if (isNaN(vol)) vol = 0
        
        const iframe = this.$refs.youtubeIframe.contentWindow
        const targetOrigin = 'https://www.youtube.com'
        
        if (vol > 0) {
          console.log(`Aplicando volume do YouTube: ${vol}%`)
          // Envia comandos de volume e desmuda
          iframe.postMessage(JSON.stringify({ event: 'command', func: 'setVolume', args: [vol] }), targetOrigin)
          iframe.postMessage(JSON.stringify({ event: 'command', func: 'unMute', args: [] }), targetOrigin)
          
          // Reforço em 100ms
          setTimeout(() => {
            iframe.postMessage(JSON.stringify({ event: 'command', func: 'setVolume', args: [vol] }), targetOrigin)
            iframe.postMessage(JSON.stringify({ event: 'command', func: 'unMute', args: [] }), targetOrigin)
          }, 100)
        } else {
          console.log('Mutando YouTube (volume 0)')
          iframe.postMessage(JSON.stringify({ event: 'command', func: 'mute', args: [] }), targetOrigin)
        }
      },
      onIframeLoad () {
        let attempts = 0
        const interval = setInterval(() => {
          if (!this.$refs.youtubeIframe || attempts > 10) {
            clearInterval(interval)
            return
          }
          this.applyYoutubeVolume()
          attempts++
        }, 500)
      },
      resumeVideo () {
        this.showingVideo = true
        this.$nextTick(() => {
          if (this.$refs.youtubeIframe) {
            console.log('Enviando comando playVideo para o YouTube')
            const targetOrigin = 'https://www.youtube.com'
            this.$refs.youtubeIframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: [] }), targetOrigin)
            
            // Pequeno delay para garantir que o player processe o play antes de aplicar o volume
            setTimeout(() => {
              this.applyYoutubeVolume()
            }, 500)

            // Reforço adicional após 2 segundos para garantir a restauração do volume
            setTimeout(() => {
              this.applyYoutubeVolume()
            }, 2000)
          }
        })
      },
      playAudio () {
        if (this.isCalling || this.messageQueue.length === 0) {
          return
        }
        this.isCalling = true
        if (this.$refs.youtubeIframe) {
          console.log('Enviando comando pauseVideo para o YouTube')
          const targetOrigin = '*' // Usar * para garantir entrega em ambiente Electron/File
          const iframe = this.$refs.youtubeIframe.contentWindow
          
          // Envia comandos de pausa e mute para garantir silêncio total
          iframe.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }), targetOrigin)
          iframe.postMessage(JSON.stringify({ event: 'command', func: 'mute', args: [] }), targetOrigin)
          
          // Repete após um pequeno delay para garantir que o player processe
          setTimeout(() => {
            if (this.$refs.youtubeIframe) {
              this.$refs.youtubeIframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }), targetOrigin)
            }
          }, 200)
        }
        this.showingVideo = false
        
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel()
        }

        this.lastMessage = this.messageQueue.shift()

        const startTime = Date.now()
        const MIN_DELAY = 6000 // 6 seconds

        console.log('Iniciando reprodução de áudio/WAV para:', this.lastMessage.$data.numeroSenha)

        audio.playAlert(this.config.alert)
          .then(() => {
            console.log('Áudio WAV finalizado.')
            if (!this.config.speech) {
              console.log('Vocalização (speech) está desativada.')
              return Promise.resolve()
            }
            console.log('Iniciando vocalização...')
            let texts = ['Senha']
            this.lastMessage.$data.siglaSenha.split('').forEach(char => texts.push(char))
            texts.push(this.lastMessage.$data.numeroSenha)
            texts.push(this.lastMessage.$data.local)
            texts.push(this.lastMessage.$data.numeroLocal)
            return speech.speechAll(texts, this.config.locale)
          })
          .then(() => {
            console.log('Fila de áudio concluída com sucesso.')
            const elapsed = Date.now() - startTime
            const waitTime = Math.max(0, MIN_DELAY - elapsed)
            setTimeout(() => {
              this.isCalling = false
              if (this.messageQueue.length === 0) {
                this.resumeVideo()
              } else {
                this.playAudio()
              }
            }, waitTime)
          })
          .catch(err => {
            console.error('Falha na cadeia de áudio/voz:', err)
            const elapsed = Date.now() - startTime
            const waitTime = Math.max(0, MIN_DELAY - elapsed)
            setTimeout(() => {
              this.isCalling = false
              if (this.messageQueue.length === 0) {
                this.resumeVideo()
              } else {
                this.playAudio()
              }
            }, waitTime)
          })
      },
      color (prefix, fallback) {
        const peso = this.lastMessage && this.lastMessage.$data ? this.lastMessage.$data.peso : 0
        const suffix = peso > 0 ? 'Priority' : 'Normal'
        return this.config[prefix + suffix] || this.config[fallback + suffix]
      }
    },
    watch: {
      config: {
        immediate: true,
        deep: true,
        handler (newConfig) {
          if (!newConfig) return
          speech.configure({
            endpoint: newConfig.piperEndpoint || 'http://localhost:5500/tts',
            engine: newConfig.speechEngine || 'native',
            lengthScale: newConfig.piperLengthScale,
            noiseScale: newConfig.piperNoiseScale
          })
        }
      },
      message () {
        this.call()
      }
    }
  }
</script>

<style lang="sass">
  @import "https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap"

  .novosga-default
    font-family: 'Outfit', sans-serif
    position: fixed
    width: 100%
    height: 100%
    overflow: hidden

    .columns
      height: 100%
      margin: 0

    .featured-column
      height: 100vh
      display: flex
      flex-direction: column
      
      .video-container
        height: 55vh
        width: 100%
        background: #000
        iframe
          width: 100%
          height: 100%

      .ticket-header
        height: 30vh
        display: flex
        align-items: center
        justify-content: center
        transition: all 0.4s ease
        overflow: hidden

      .ticket-footer
        height: 15vh
        min-height: 15vh
        max-height: 15vh
        flex-shrink: 0
        padding: 2vh 4vh
        display: flex
        align-items: center
        background: rgba(0,0,0,0.05)
        backdrop-filter: blur(10px)
        overflow: hidden
        
        .logo
          height: 8vh
          margin-right: 4vh

        .footer-text
          font-size: 4.5vh
          font-weight: 700

      &:not(.is-hybrid)
        .ticket-header
          height: 85vh
          .featured-message
            .title
              font-size: 30vh
            .subtitle
              font-size: 10vh
            .description
              font-size: 8vh

    .featured-message
      text-align: center
      .title
        font-size: 14vh
        font-weight: 900
        line-height: 1
        text-shadow: 0 10px 30px rgba(0,0,0,0.15)
        margin-bottom: 2vh
      .subtitle
        font-size: 6vh
        font-weight: 700
      .description
        font-size: 4vh
        opacity: 0.9
        text-transform: uppercase
        letter-spacing: 2px

    .history-column
      height: 100vh
      box-shadow: -10px 0 40px rgba(0,0,0,0.15)
      z-index: 10
      display: flex
      flex-direction: column
      
      >header
        height: 85vh
        padding: 2rem
        overflow: hidden
        flex: 1
      >footer
        height: 15vh
        min-height: 15vh
        max-height: 15vh
        flex-shrink: 0
        padding: 1rem 0
        text-align: center
        background: rgba(0,0,0,.15)
        backdrop-filter: blur(10px)
        display: flex
        align-items: center
        justify-content: center
        overflow: hidden
      
      .title
        text-align: center
        font-weight: 900
        text-transform: uppercase
        letter-spacing: 3px
        margin-bottom: 2rem
        font-size: 1.5rem
        opacity: 0.9

    .clock
      padding-top: 1vh
      display: flex
      flex-direction: column
      align-items: center
      justify-content: center

      .date
        line-height: 1
        margin-bottom: 0.2vh
        span
          font-size: 1.8vw
          font-weight: bold
          opacity: 0.8

      .time
        line-height: 1
        span
          font-size: 4.2vw
        span.hours
          font-weight: bold
        span.seconds
          font-size: 2.5vw
          font-style: italic
          opacity: 0.7
          margin-left: 0.5vw

    .history
      padding: 1vh
      .message
        position: relative
        background: rgba(255, 255, 255, 0.05)
        backdrop-filter: blur(12px)
        border-radius: 16px
        border: 1px solid rgba(255, 255, 255, 0.1)
        padding: 2vh
        margin-bottom: 2vh
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1)
        transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1)
        overflow: hidden

        // Borda de destaque (accent)
        &:before
          content: ''
          position: absolute
          left: 0
          top: 0
          bottom: 0
          width: 6px
          background: rgba(255,255,255,0.3)
          transition: width 0.3s ease

        &:hover
          transform: translateX(5px)
          background: rgba(255, 255, 255, 0.08)
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15)
          &:before
            width: 10px

        span
          display: block
          line-height: 1.2

        .title
          font-size: 5vh
          font-weight: 900
          margin-bottom: 0.5vh
          letter-spacing: -1px
          text-shadow: 0 2px 10px rgba(0,0,0,0.1)
        
        .subtitle
          font-size: 2.2vh
          font-weight: 700
          opacity: 0.9
          margin-bottom: 0.5vh
        
        .description
          font-size: 1.8vh
          font-weight: 400
          text-transform: uppercase
          letter-spacing: 1px
          opacity: 0.6
</style>
