/**
 * This file is used specifically and only for development. It installs
 * `electron-debug` & `vue-devtools`. There shouldn't be any need to
 *  modify this file, but it can be used to extend your development
 *  environment.
 */

/* eslint-disable */

// Install `electron-debug`
const electronDebug = require('electron-debug')
if (typeof electronDebug === 'function') {
  electronDebug({ showDevTools: true })
} else if (electronDebug && typeof electronDebug.default === 'function') {
  electronDebug.default({ showDevTools: true })
}

// Install `vue-devtools`
require('electron').app.on('ready', () => {
  let installExtension = require('electron-devtools-installer')
  const install = installExtension.default || installExtension
  install(installExtension.VUEJS_DEVTOOLS)
    .then(() => {})
    .catch(err => {
      console.log('Unable to install `vue-devtools`: \n', err)
    })
})

// Require `main` process to boot app
require('./index')