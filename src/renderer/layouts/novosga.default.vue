<template>
  <div class="novosga-default layout-content" :style="{ 'background-color': color('pageBgColor'), 'color': color('pageFontColor') }">
    <div class="columns is-gapless">
      <div class="column is-multiline featured-column" :class="{ 'is-hybrid': isHybrid }">
        <div class="video-container" v-show="isHybrid" style="width: 100%;">
          <iframe ref="youtubeIframe" :src="youtubeUrl" @load="onIframeLoad" frameborder="0" allow="autoplay; encrypted-media" style="width: 100%; height: 100%;"></iframe>
        </div>

        <header class="column ticket-header" v-show="!hasVideo || !showingVideo || isHybrid">
          <featured :message="lastMessage" v-if="lastMessage" :fontColor="color('featuredFontColor', 'pageFontColor')"></featured>
        </header>
        <footer class="column ticket-footer" :style="{ 'background-color': color('footerBgColor'), 'color': color('footerFontColor') }" v-show="!isHybrid">
          <img :src="logoUrl" class="is-pulled-left">
          <h1 class="is-pulled-left" v-if="config.themeOptions && config.themeOptions.footerText" :style="{ 'color': color('footerFontColor') }">
            {{ config.themeOptions.footerText }}
          </h1>
        </footer>
      </div>
      <div class="column is-one-quarter history-column" :style="{ 'background-color': color('sidebarBgColor'), 'color': color('sidebarFontColor') }">
        <header>
          <h2 class="title" :style="{ 'color': color('sidebarFontColor') }">
            {{ 'history.title'|trans }}
          </h2>
          <history
            v-if="lastMessage"
            :messages="messages"
            :fontColorNormal="config.historyFontColorNormal || config.sidebarFontColorNormal"
            :fontColorPriority="config.historyFontColorPriority || config.sidebarFontColorPriority">
          </history>
        </header>
        <footer :style="{ 'background-color': color('clockBgColor'), 'color': color('clockFontColor') }">
          <clock :locale="config.locale" :dateFormat="'date_format'|trans" :fontColor="color('clockFontColor')"></clock>
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
          url += `videoseries?list=${first.id}&`
        } else {
          url += `${first.id}?`
        }
        url += `enablejsapi=1&autoplay=1&mute=${mute}&controls=${controls}&loop=1`

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
        const vol = this.config.youtubeVolume !== undefined ? this.config.youtubeVolume : 0
        if (vol > 0) {
          this.$refs.youtubeIframe.contentWindow.postMessage('{"event":"command","func":"unMute","args":""}', '*')
          this.$refs.youtubeIframe.contentWindow.postMessage(`{"event":"command","func":"setVolume","args":[${vol}]}`, '*')
        } else {
          this.$refs.youtubeIframe.contentWindow.postMessage('{"event":"command","func":"mute","args":""}', '*')
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
        if (this.$refs.youtubeIframe) {
          this.$refs.youtubeIframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*')
          this.applyYoutubeVolume()
        }
      },
      playAudio () {
        if (this.isCalling || this.messageQueue.length === 0) {
          return
        }
        this.isCalling = true
        this.showingVideo = false
        if (this.$refs.youtubeIframe) {
          this.$refs.youtubeIframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*')
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
      message () {
        this.call()
      }
    }
  }
</script>

<style lang="sass">
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap')

  .novosga-default
    font-family: 'Outfit', sans-serif
    .layout-content
      position: fixed
      width: 100%
      height: 100%
      .columns
        height: 100%

    .clock
      .time
        span
          font-size: 4vw
        span.hours
          font-weight: bold
        span.seconds
          font-style: italic
          opacity: 0.8
      .date
        text-align: center
        span
          font-size: 2vw
          font-weight: bold

    .featured-column
        >header
          height: 80vh
          display: flex
          align-items: center
          justify-content: center
          transition: height 0.4s ease
        >footer
          height: 20vh
          padding: 5vh
          background: rgba(0,0,0,0.05)
          backdrop-filter: blur(10px)
          img
            height: 10vh
          h1
            font-size: 5vh
            padding: 2vh 0 0 5vh
            font-weight: 700
        .featured-message
          text-align: center
          transition: all 0.4s ease
          .title
            font-size: 30vh
            font-weight: 900
            line-height: 1
            text-shadow: 0 10px 30px rgba(0,0,0,0.15)
            margin-bottom: 2vh
            transition: font-size 0.4s ease
          .subtitle
            font-size: 10vh
            font-weight: 700
            text-shadow: 0 5px 15px rgba(0,0,0,0.1)
            transition: font-size 0.4s ease
          .description
            font-size: 8vh
            opacity: 0.9
            text-transform: uppercase
            letter-spacing: 2px
            text-shadow: 0 5px 15px rgba(0,0,0,0.1)
            transition: font-size 0.4s ease

    .featured-column.is-hybrid
      >header
        height: 35vh
      .video-container
        height: 65vh
      .featured-message
        .title
          font-size: 14vh
          margin-bottom: 0
        .subtitle
          font-size: 6vh
        .description
          font-size: 4vh

    .history-column
      height: 100vh
      box-shadow: -10px 0 40px rgba(0,0,0,0.15)
      position: relative
      z-index: 10
      >header
        height: 80vh
        padding: 2rem
        overflow: hidden
      >footer
        height: 20vh
        padding: 1rem 0
        text-align: center
        background: rgba(0,0,0,.15)
        backdrop-filter: blur(10px)
      *
        color: inherit
      .title
        text-align: center
        font-weight: 900
        text-transform: uppercase
        letter-spacing: 3px
        margin-bottom: 2rem
        font-size: 1.5rem
        opacity: 0.9
      .empty
        p
          font-style: italic
          text-align: center
          opacity: 0.6
      .history
        .history-list-enter-active, .history-list-leave-active
          transition: all 0.5s ease
        .history-list-enter, .history-list-leave-to
          opacity: 0
          transform: translateY(-30px) scale(0.95)
        .message
          background-color: rgba(255, 255, 255, 0.12)
          backdrop-filter: blur(15px)
          border-radius: 20px
          border: 1px solid rgba(255, 255, 255, 0.2)
          box-shadow: 0 8px 32px rgba(0,0,0,0.08)
          padding: 1.5rem
          margin-bottom: 1.5rem
          transition: transform 0.3s ease, box-shadow 0.3s ease
          span
            text-align: left
            display: block
          .title
            font-size: 5vh
            font-weight: 900
            line-height: 1.1
            margin-bottom: 0.5rem
            text-shadow: 0 2px 5px rgba(0,0,0,0.1)
            letter-spacing: 0
            text-transform: none
          .subtitle
            font-size: 2.5vh
            font-weight: 700
            opacity: 0.9
          .description
            font-size: 2vh
            opacity: 0.7
            margin-top: 0.5rem
            text-transform: uppercase
            letter-spacing: 1px
</style>
