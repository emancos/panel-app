'use strict'

import { app, BrowserWindow, Menu, session } from 'electron'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://127.0.0.1:9080`
  : `file://${__dirname}/index.html`

// Fix for SIGSYS / clone3 crashes on modern Linux distributions running older Electron
app.commandLine.appendSwitch('no-sandbox')
app.commandLine.appendSwitch('disable-gpu-sandbox')
app.commandLine.appendSwitch('disable-dev-shm-usage')
app.commandLine.appendSwitch('disable-vulkan')
app.commandLine.appendSwitch('ozone-platform-hint', 'auto')

function createWindow () {
  const fullscreen = process.argv.indexOf('--fullscreen') !== -1

  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    useContentSize: true,
    fullscreen,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
      allowRunningInsecureContent: true
    }
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.maximize()

  const template = [
    {
      label: 'View',
      submenu: [
        {
          label: 'Settings',
          click () {
            if (mainWindow.webContents) {
              mainWindow.webContents.send('navigate', '/settings')
            }
          }
        },
        {type: 'separator'},
        {role: 'reload'},
        {role: 'forcereload'},
        {role: 'toggledevtools'},
        {type: 'separator'},
        {role: 'togglefullscreen'}
      ]
    },
    { role: 'editMenu' },
    {
      role: 'window',
      submenu: [
        {role: 'minimize'},
        {role: 'close'}
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'About',
          click () { require('electron').shell.openExternal('http://novosga.org') }
        }
      ]
    }
  ]

  if (!fullscreen) {
    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
  }
}

app.on('ready', () => {
  // Ignora restrições de Origin/Referer do Youtube para que o embed funcione em ambiente local (file://)
  const filter = {
    urls: ['*://*.youtube.com/*', '*://*.youtube-nocookie.com/*']
  }
  session.defaultSession.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
    const headers = Object.assign({}, details.requestHeaders, {
      'Referer': 'https://www.youtube.com/',
      'Origin': 'https://www.youtube.com/'
    })
    callback({ requestHeaders: headers })
  })
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
