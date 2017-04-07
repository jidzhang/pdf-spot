'use strict'

import { app, BrowserWindow } from 'electron'

// var globalShortcut = require('global-shortcut');

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
    ? `http://localhost:${require('../../../config').port}`
    : `file://${__dirname}/index.html`

function createWindow () {
    /**
     * Initial window options
     */
  mainWindow = new BrowserWindow({
    height: 800,
    width: 1400
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })

    // 注册快捷键, 可能比较危险
    // registerShortcut()

    // eslint-disable-next-line no-console
  console.log('mainWindow opened')
}

app.on('ready', createWindow)

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

// // 注册快捷键用于打开开发者工具以及刷新当前页面
// function registerShortcut () {
//   function doRegister (cmd, callback) {
//     globalShortcut.register(cmd, callback)
//   }

//   doRegister('F12', function () {
//     var win = BrowserWindow.getFocusedWindow()
//     win.webContents.toggleDevTools()
//     console.log('toggleDevTools F12')
//   })

//     // windows 平台下`F12`按键按下收不到消息(貌似还没有解决方案)，所以写了一个替代按键
//   doRegister('F6', function () {
//     var win = BrowserWindow.getFocusedWindow()
//     win.webContents.toggleDevTools()
//     console.log('toggleDevTools F6')
//   })

//   doRegister('F5', function () {
//     var win = BrowserWindow.getFocusedWindow()
//     win.reload()
//     console.log('refresh')
//   })

//   return
// }
