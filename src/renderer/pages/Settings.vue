<template>
  <div class="container">
    <div class="columns is-mobile">
      <div class="column is-2-desktop is-3-tablet is-3-mobile">
        <aside class="menu">
          <img :src="config.customLogo || 'static/images/logo.png'">

          <hr>

          <router-link to="/">
            <span class="icon">
              <i class="fa fa-chevron-left"></i>
            </span>
            {{ 'menu.go_back'|trans }}
          </router-link>

          <p class="menu-label">
            {{ 'menu.general'|trans }}
          </p>

          <ul class="menu-list">
            <li>
              <a @click="showTab('interface')" :class="{ 'is-active': (tab==='interface') }">
                {{ 'menu.interface'|trans }}
              </a>
            </li>
            <li>
              <a @click="showTab('server')" :class="{ 'is-active': (tab==='server') }">
                {{ 'menu.server'|trans }}
              </a>
            </li>
            <li>
              <a @click="showTab('services')" :class="{ 'is-active': (tab==='services') }" v-if="unities.length">
                {{ 'menu.services'|trans }}
              </a>
            </li>
            <li>
              <a @click="showTab('sound')" :class="{ 'is-active': (tab==='sound') }">
                {{ 'menu.sound'|trans }}
              </a>
            </li>
            <li>
              <a @click="showTab('video')" :class="{ 'is-active': (tab==='video') }">
                Vídeo / TV
              </a>
            </li>
          </ul>
        </aside>
      </div>
      <div class="column is-10-desktop is-9-tablet is-9-mobile">
        <div class="heading">
          <h1 class="title">
            {{ 'settings.title'|trans }}
          </h1>
          <h2 class="subtitle">
            {{ 'settings.subtitle'|trans }}
          </h2>
        </div>

        <hr>

        <form @submit.prevent="save" v-if="tab==='interface'">
          <div class="columns">
            <div class="column is-4">
              <div class="field">
                <label class="label">
                  {{ 'settings.label.locale'|trans }}
                </label>
                <div class="control is-expanded has-icons-left">
                  <span class="select is-fullwidth">
                    <select v-model="config.locale">
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="pt_BR">Português (Brasil)</option>
                    </select>
                  </span>
                  <span class="icon is-left">
                    <i class="fa fa-globe"></i>
                  </span>
                </div>
              </div>
            </div>
            <div class="column is-4">
              <div class="field">
                <label class="label">
                  {{ 'settings.label.theme'|trans }}
                </label>
                <div class="control is-expanded has-icons-left">
                  <span class="select is-fullwidth">
                    <select v-model="config.theme" @change="changeTheme">
                      <option :value="theme.id" v-for="theme in themes" :key="theme.id">
                        {{ theme.name }}
                      </option>
                    </select>
                  </span>
                  <span class="icon is-left">
                    <i class="fa fa-paint-brush"></i>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <h3 class="title" v-if="selectedTheme && selectedTheme.options.length">{{ 'settings.interface.theme_options'| trans }}</h3>

          <div class="columns" v-if="selectedTheme && selectedTheme.options.length">
            <div class="column">
              <div class="field" v-for="option in selectedTheme.options" :key="option.name">
                <label class="label">
                  {{ option.label }}
                </label>
                <div class="control is-expanded">
                  <input :type="option.type" :placeholder="option.placeholder" v-model="config.themeOptions[option.name]" class="input is-medium">
                </div>
              </div>
            </div>
          </div>

          <h3 class="title">Logo Personalizada</h3>
          <div class="columns">
            <div class="column">
              <div class="field">
                <label class="label">Escolha uma imagem do seu computador</label>
                <div class="control">
                  <div class="file has-name is-info is-medium">
                    <label class="file-label">
                      <input class="file-input" type="file" accept="image/*" @change="onLogoSelected">
                      <span class="file-cta">
                        <span class="file-icon">
                          <i class="fa fa-upload"></i>
                        </span>
                        <span class="file-label">
                          Procurar imagem...
                        </span>
                      </span>
                      <span class="file-name">
                        {{ config.customLogo ? 'Logo_Ativa.png' : 'Nenhum arquivo' }}
                      </span>
                    </label>
                  </div>
                </div>
                <p class="help">A imagem será salva no próprio navegador e substituirá o logo padrão.</p>
                <div v-if="config.customLogo" style="margin-top: 1rem; border: 2px dashed #dbdbdb; padding: 1rem; border-radius: 8px; text-align: center; max-width: 300px;">
                  <img :src="config.customLogo" style="max-height: 120px; border-radius: 5px;">
                  <br>
                  <button type="button" class="button is-danger is-outlined is-small" @click="config.customLogo = null" style="margin-top: 1rem;">
                    <span class="icon is-small"><i class="fa fa-trash"></i></span>
                    <span>Remover Logo</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <h3 class="title">{{ 'settings.interface.colors'| trans }}</h3>

          <div class="columns">
            <div class="column">
              <div class="field">
                <label class="label">
                  {{ 'settings.label.page_bg_color_normal'|trans }}
                </label>
                <div class="control">
                  <input class="input is-medium" type="color" v-model="config.pageBgColorNormal">
                </div>
              </div>
            </div>
            <div class="column">
              <div class="field">
                <label class="label">
                  {{ 'settings.label.page_font_color_normal'|trans }}
                </label>
                <div class="control">
                  <input class="input is-medium" type="color" v-model="config.pageFontColorNormal">
                </div>
              </div>
            </div>
            <div class="column">
              <div class="field">
                <label class="label">
                  {{ 'settings.label.page_bg_color_priority'|trans }}
                </label>
                <div class="control">
                  <input class="input is-medium" type="color" v-model="config.pageBgColorPriority">
                </div>
              </div>
            </div>
            <div class="column">
              <div class="field">
                <label class="label">
                  {{ 'settings.label.page_font_color_priority'|trans }}
                </label>
                <div class="control">
                  <input class="input is-medium" type="color" v-model="config.pageFontColorPriority">
                </div>
              </div>
            </div>
          </div>

          <div class="columns">
            <div class="column">
              <div class="field">
                <label class="label">
                  {{ 'settings.label.featured_font_color_normal'|trans }}
                </label>
                <div class="control">
                  <input class="input is-medium" type="color" v-model="config.featuredFontColorNormal">
                </div>
              </div>
            </div>
            <div class="column">
              <div class="field">
                <label class="label">
                  {{ 'settings.label.featured_font_color_priority'|trans }}
                </label>
                <div class="control">
                  <input class="input is-medium" type="color" v-model="config.featuredFontColorPriority">
                </div>
              </div>
            </div>
            <div class="column">
              <div class="field">
                <label class="label">
                  {{ 'settings.label.history_font_color_normal'|trans }}
                </label>
                <div class="control">
                  <input class="input is-medium" type="color" v-model="config.historyFontColorNormal">
                </div>
              </div>
            </div>
            <div class="column">
              <div class="field">
                <label class="label">
                  {{ 'settings.label.history_font_color_priority'|trans }}
                </label>
                <div class="control">
                  <input class="input is-medium" type="color" v-model="config.historyFontColorPriority">
                </div>
              </div>
            </div>
          </div>

          <div class="columns">
            <div class="column">
              <div class="field">
                <label class="label">
                  {{ 'settings.label.sidebar_bg_color_normal'|trans }}
                </label>
                <div class="control">
                  <input class="input is-medium" type="color" v-model="config.sidebarBgColorNormal">
                </div>
              </div>
            </div>
            <div class="column">
              <div class="field">
                <label class="label">
                  {{ 'settings.label.sidebar_font_color_normal'|trans }}
                </label>
                <div class="control">
                  <input class="input is-medium" type="color" v-model="config.sidebarFontColorNormal">
                </div>
              </div>
            </div>
            <div class="column">
              <div class="field">
                <label class="label">
                  {{ 'settings.label.sidebar_bg_color_priority'|trans }}
                </label>
                <div class="control">
                  <input class="input is-medium" type="color" v-model="config.sidebarBgColorPriority">
                </div>
              </div>
            </div>
            <div class="column">
              <div class="field">
                <label class="label">
                  {{ 'settings.label.sidebar_font_color_priority'|trans }}
                </label>
                <div class="control">
                  <input class="input is-medium" type="color" v-model="config.sidebarFontColorPriority">
                </div>
              </div>
            </div>
          </div>

          <div class="columns">
            <div class="column">
              <div class="field">
                <label class="label">
                  {{ 'settings.label.footer_bg_color_normal'|trans }}
                </label>
                <div class="control">
                  <input class="input is-medium" type="color" v-model="config.footerBgColorNormal">
                </div>
              </div>
            </div>
            <div class="column">
              <div class="field">
                <label class="label">
                  {{ 'settings.label.footer_font_color_normal'|trans }}
                </label>
                <div class="control">
                  <input class="input is-medium" type="color" v-model="config.footerFontColorNormal">
                </div>
              </div>
            </div>
            <div class="column">
              <div class="field">
                <label class="label">
                  {{ 'settings.label.footer_bg_color_priority'|trans }}
                </label>
                <div class="control">
                  <input class="input is-medium" type="color" v-model="config.footerBgColorPriority">
                </div>
              </div>
            </div>
            <div class="column">
              <div class="field">
                <label class="label">
                  {{ 'settings.label.footer_font_color_priority'|trans }}
                </label>
                <div class="control">
                  <input class="input is-medium" type="color" v-model="config.footerFontColorPriority">
                </div>
              </div>
            </div>
          </div>

          <div class="columns">
            <div class="column">
              <div class="field">
                <label class="label">
                  {{ 'settings.label.clock_bg_color_normal'|trans }}
                </label>
                <div class="control">
                  <input class="input is-medium" type="color" v-model="config.clockBgColorNormal">
                </div>
              </div>
            </div>
            <div class="column">
              <div class="field">
                <label class="label">
                  {{ 'settings.label.clock_font_color_normal'|trans }}
                </label>
                <div class="control">
                  <input class="input is-medium" type="color" v-model="config.clockFontColorNormal">
                </div>
              </div>
            </div>
            <div class="column">
              <div class="field">
                <label class="label">
                  {{ 'settings.label.clock_bg_color_priority'|trans }}
                </label>
                <div class="control">
                  <input class="input is-medium" type="color" v-model="config.clockBgColorPriority">
                </div>
              </div>
            </div>
            <div class="column">
              <div class="field">
                <label class="label">
                  {{ 'settings.label.clock_font_color_priority'|trans }}
                </label>
                <div class="control">
                  <input class="input is-medium" type="color" v-model="config.clockFontColorPriority">
                </div>
              </div>
            </div>
          </div>

          <hr>

          <div class="field is-grouped is-grouped-right">
            <div class="control">
              <button type="submit" class="button is-primary is-large">
                {{ 'settings.btn.save'|trans }} &nbsp;
                <span class="icon is-small">
                  <i class="fa fa-save"></i>
                </span>
              </button>
            </div>
          </div>
        </form>

        <form @submit.prevent="save" v-if="tab==='server'">
          <div class="field">
            <label class="label">
              {{ 'settings.label.server'|trans }}
            </label>
            <div class="control">
              <input class="input is-medium" type="url" placeholder="https://" v-model="config.server" @change="changeServer">
            </div>
          </div>

          <div class="field">
            <label class="label">
              {{ 'settings.label.username'|trans }}
            </label>
            <div class="control">
              <input class="input is-medium" type="text" placeholder="" v-model="config.username">
            </div>
          </div>

          <div class="field">
            <label class="label">
              {{ 'settings.label.password'|trans }}
            </label>
            <div class="control">
              <input class="input is-medium" type="password" placeholder="" v-model="config.password">
            </div>
          </div>

          <div class="field">
            <label class="label">
              {{ 'settings.label.client_id'|trans }}
            </label>
            <div class="control">
              <input class="input is-medium" type="text" placeholder="" v-model="config.clientId">
            </div>
          </div>

          <div class="field">
            <label class="label">
              {{ 'settings.label.client_secret'|trans }}
            </label>
            <div class="control">
              <input class="input is-medium" type="password" placeholder="" v-model="config.clientSecret">
            </div>
          </div>

          <div class="field">
            <label class="label">
              {{ 'settings.label.retries'|trans }}
            </label>
            <div class="control">
              <input class="input is-medium" type="text" placeholder="" v-model="config.retries">
            </div>
          </div>

          <hr>

          <div class="field is-grouped is-grouped-right">
            <div class="control">
              <button type="submit" class="button is-primary is-large">
                {{ 'settings.btn.save'|trans }} &nbsp;
                <span class="icon is-small">
                  <i class="fa fa-save"></i>
                </span>
              </button>
            </div>
          </div>
        </form>

        <form @submit.prevent="save" v-if="tab==='services'">
          <div class="field">
            <label class="label">
              {{ 'settings.label.unity'|trans }}
            </label>
            <div class="control">
              <div class="select is-fullwidth">
                <select v-model="config.unity" @change="loadServices">
                  <option></option>
                  <option v-for="unity in unities" :value="unity.id" :key="unity.id">
                    {{ unity.nome }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div class="field">
            <label class="label">
              {{ 'settings.label.services'|trans }}
            </label>
            <div class="control" v-for="service in services" :key="service.servico.id">
              <label class="checkbox">
                <input type="checkbox" :value="service.servico.id" v-model="config.services">
                {{service.sigla}} - {{service.servico.nome}}
              </label>
            </div>
            <div class="control" v-if="!services || !services.length">
              {{ 'settings.services.empty'|trans }}
            </div>
          </div>

          <hr>

          <div class="field is-grouped is-grouped-right">
            <div class="control">
              <button type="submit" class="button is-primary is-large">
                {{ 'settings.btn.save'|trans }} &nbsp;
                <span class="icon is-small">
                  <i class="fa fa-save"></i>
                </span>
              </button>
            </div>
          </div>
        </form>

        <form @submit.prevent="save" v-if="tab==='sound'">
          <div class="field">
            <label class="label">
              {{ 'settings.label.alert'|trans }}
            </label>
            <div class="control has-addons">
              <div class="select">
                <select v-model="config.alert">
                  <option v-for="(i, alert) in alerts" :value="i" :key="i">
                    {{ alert }}
                  </option>
                </select>
              </div>
              <a class="button" title="Play">
                <span class="icon is-small" @click.prevent="testAlert">
                  <i class="fa fa-play"></i>
                </span>
              </a>
            </div>
          </div>
          <div class="field">
            <div class="control has-addons">
              <label class="checkbox">
                <input type="checkbox" v-model="config.speech">
                {{ 'settings.label.speech_enabled'|trans }}
              </label>
              <a class="button" title="Play">
                <span class="icon is-small" @click.prevent="testSpeech">
                  <i class="fa fa-play"></i>
                </span>
              </a>
            </div>
          </div>

          <hr>

          <div class="field is-grouped is-grouped-right">
            <div class="control">
              <button type="submit" class="button is-primary is-large">
                {{ 'settings.btn.save'|trans }} &nbsp;
                <span class="icon is-small">
                  <i class="fa fa-save"></i>
                </span>
              </button>
            </div>
          </div>
        </form>

        <form @submit.prevent="save" v-if="tab==='video'">
          <div class="field">
            <label class="label">Fila de Vídeos/Playlists do YouTube</label>
            <div v-for="(item, index) in config.youtubeUrls" :key="index" class="field has-addons">
              <div class="control is-expanded">
                <input class="input is-medium" type="text" placeholder="Cole o link do vídeo ou playlist do YouTube" v-model="item.url" @change="parseYoutubeUrls">
              </div>
              <div class="control">
                <a class="button is-danger is-medium" @click="removeYoutubeUrl(index)" title="Remover">
                  <span class="icon is-small"><i class="fa fa-trash"></i></span>
                </a>
              </div>
            </div>
            <div class="control" style="margin-top: 1rem; margin-bottom: 1rem;">
              <button type="button" class="button is-info is-small" @click="addYoutubeUrl">
                <span class="icon is-small"><i class="fa fa-plus"></i></span>
                <span>Adicionar Novo Link</span>
              </button>
            </div>
            <p class="help">O painel tocará os links em ordem. Se for uma playlist, ele tocará a playlist inteira.</p>
          </div>
          <div class="field">
            <label class="label">Volume do Vídeo ({{ config.youtubeVolume }}%)</label>
            <div class="control">
              <input type="range" min="0" max="100" v-model="config.youtubeVolume" style="width: 100%;">
            </div>
            <p class="help">Se o volume for maior que zero, <strong>você precisará clicar na tela do painel uma vez</strong> após abri-la para que o navegador permita a reprodução com som.</p>
          </div>
          <div class="field">
            <label class="checkbox">
              <input type="checkbox" v-model="config.youtubeControls">
              Exibir barra de progresso/controles do YouTube
            </label>
          </div>
          <hr>
          <div class="field is-grouped is-grouped-right">
            <div class="control">
              <button type="submit" class="button is-primary is-large">
                {{ 'settings.btn.save'|trans }} &nbsp;
                <span class="icon is-small">
                  <i class="fa fa-save"></i>
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
  import audio from '@/services/audio'
  import speech from '@/services/speech'
  import { log } from '@/util/functions'

  function load (ctx, isInit) {
    const config = JSON.parse(JSON.stringify(ctx.$store.state.config))
    // defaults
    config.locale = config.locale || 'en'
    config.retries = config.retries || 5
    config.theme = config.theme || ctx.themes[0].id
    config.themeOptions = config.themeOptions || {}
    config.customLogo = config.customLogo || null
    config.services = config.services || []
    config.alert = config.alert || audio.alertsAvailable.Default
    config.speech = !!config.speech

    config.pageBgColorNormal = config.pageBgColorNormal || '#FFFFFF'
    config.pageFontColorNormal = config.pageFontColorNormal || '#000000'
    config.pageBgColorPriority = config.pageBgColorPriority || '#FFFFFF'
    config.pageFontColorPriority = config.pageFontColorPriority || '#FF0000'
    config.featuredFontColorNormal = config.featuredFontColorNormal || '#000000'
    config.featuredFontColorPriority = config.featuredFontColorPriority || '#FF0000'
    config.historyFontColorNormal = config.historyFontColorNormal || '#000000'
    config.historyFontColorPriority = config.historyFontColorPriority || '#FF0000'
    config.sidebarBgColorNormal = config.sidebarBgColorNormal || '#4FC08D'
    config.sidebarFontColorNormal = config.sidebarFontColorNormal || '#000000'
    config.sidebarBgColorPriority = config.sidebarBgColorPriority || '#4FC08D'
    config.sidebarFontColorPriority = config.sidebarFontColorPriority || '#000000'
    config.footerBgColorNormal = config.footerBgColorNormal || '#F1F1F1'
    config.footerFontColorNormal = config.footerFontColorNormal || '#000000'
    config.footerBgColorPriority = config.footerBgColorPriority || '#F1F1F1'
    config.footerFontColorPriority = config.footerFontColorPriority || '#000000'
    config.clockBgColorNormal = config.clockBgColorNormal || '#44A075'
    config.clockFontColorNormal = config.clockFontColorNormal || '#000000'
    config.clockBgColorPriority = config.clockBgColorPriority || '#44A075'
    config.clockFontColorPriority = config.clockFontColorPriority || '#000000'

    config.youtubeUrls = config.youtubeUrls || []
    if (config.youtubeUrls.length === 0) {
      config.youtubeUrls.push({ url: '', id: null, isPlaylist: false })
    }

    // Migration from old youtubeMuted
    if (config.youtubeVolume === undefined) {
      config.youtubeVolume = config.youtubeMuted === false ? 100 : 0
    }

    config.youtubeControls = !!config.youtubeControls

    ctx.config = config

    if (ctx.$store.getters.isAuthenticated) {
      const forceLoad = (
        isInit ||
        !ctx.unities ||
        ctx.unities.length === 0
      )

      ctx.fetchUnities = forceLoad
      ctx.fetchServices = forceLoad

      if (ctx.$store.getters.isExpired) {
        log('token expired, trying to refresh')

        ctx.$store.dispatch('token').then(() => {
          log('token refreshed successfully!')
          ctx.loadData()
        }, () => {
          log('error on refresh token')
        })
      } else {
        ctx.loadData()
      }
    }

    ctx.initialClientId = ctx.config.clientId
    ctx.initialClientSecret = ctx.config.clientSecret
    ctx.initialUsername = ctx.config.username
    ctx.initialPassword = ctx.config.password
  }

  export default {
    name: 'Settings',
    data () {
      return {
        tab: 'interface',
        config: {},
        initialClientId: null,
        initialClientSecret: null,
        initialUsername: null,
        initialPassword: null,
        fetchUnities: !this.unities,
        fetchServices: !this.services
      }
    },
    computed: {
      unities () {
        return this.$store.state.settings.unities
      },
      services () {
        return this.$store.state.settings.services
      },
      themes () {
        return this.$store.state.settings.availableThemes
      },
      selectedTheme () {
        return this.$store.getters.getTheme(this.config.theme)
      },
      alerts () {
        return audio.alertsAvailable
      },
      isCredentialChanged () {
        return (
          this.initialClientId !== this.config.clientId ||
          this.initialClientSecret !== this.config.clientSecret ||
          this.initialUsername !== this.config.username ||
          this.initialPassword !== this.config.password
        )
      }
    },
    methods: {
      showTab (tab) {
        this.tab = tab
      },
      changeTheme () {
        this.config.themeOptions = {}
      },
      changeServer () {
        this.config.unity = null
        this.fetchUnities = true
        this.fetchServices = false
      },
      onLogoSelected (event) {
        const file = event.target.files[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = (e) => {
          this.$set(this.config, 'customLogo', e.target.result)
        }
        reader.readAsDataURL(file)
      },
      loadData () {
        if (this.fetchUnities && this.config.server) {
          this.$store
            .dispatch('fetchUnities')
            .then(() => {}, (error) => {
              this.$swal('Oops!', error, 'error')
            })
          this.fetchUnities = false
        }

        if (this.fetchServices && this.config.unity) {
          this.$store.dispatch('fetchServices', this.config.unity)
          this.fetchServices = false
        }
      },
      loadServices () {
        this.$store.dispatch('fetchServices', this.config.unity)
      },
      addYoutubeUrl () {
        if (!this.config.youtubeUrls) {
          this.$set(this.config, 'youtubeUrls', [])
        }
        this.config.youtubeUrls.push({ url: '', id: null, isPlaylist: false })
      },
      removeYoutubeUrl (index) {
        this.config.youtubeUrls.splice(index, 1)
        this.parseYoutubeUrls()
      },
      parseYoutubeUrls () {
        if (!this.config.youtubeUrls) return
        this.config.youtubeUrls.forEach(item => {
          if (!item.url) {
            item.id = null
            item.isPlaylist = false
            return
          }
          const url = item.url.trim()
          const listMatch = url.match(/[?&]list=([^&]+)/)
          if (listMatch) {
            item.id = listMatch[1]
            item.isPlaylist = true
            return
          }
          const videoMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&]{11})/)
          if (videoMatch) {
            item.id = videoMatch[1]
            item.isPlaylist = false
            return
          }
          if (url.length === 11 || url.startsWith('PL')) {
            item.id = url
            item.isPlaylist = url.startsWith('PL')
          } else {
            item.id = null
            item.isPlaylist = false
          }
        })
      },
      save () {
        this.$store.dispatch('saveConfig', this.config)

        const token = (
          !this.$store.getters.isAuthenticated ||
          this.$store.getters.isExpired ||
          this.isCredentialChanged
        )

        let promise

        if (token) {
          promise = this.$store.dispatch('token')
        } else {
          promise = Promise.resolve()
        }

        promise.then(() => {
          this.$swal('Success', 'Configuration Ok', 'success')
          load(this, false)
        }, error => {
          this.$swal('Oops!', error, 'error')
        })
      },
      testAlert () {
        if (this.config.alert) {
          audio.playAlert(this.config.alert)
        }
      },
      testSpeech () {
        const lang = this.config.locale || 'pt-BR'
        log('Testing speech lang', lang)

        speech.speechAll([
          'Senha',
          '21',
          'mesa',
          '5'
        ], lang).then(() => {
          log('Testing end')
        }, (e) => {
          log('Testing error', e)
        })
      }
    },
    beforeMount () {
      load(this, true)
    }
  }
</script>

<style lang="sass">
  aside
    img
      width: 100%
      max-height: 60px
  .columns .column
    padding: 2rem
</style>
