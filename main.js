const { NONAME } = require("dns");
const { app, BrowserWindow, remote } = require("electron");
const ipcMain = require('electron').ipcMain
const path = require("path");
const { deflate } = require("zlib");

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 650,
    resizable: false,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      enableBlinkFeatures: true,
      enableWebSQL: true
    }
  });
  mainWindow.webContents.on("dom-ready", () => {
    console.log("finished");
  });
  ipcMain.once('quit', () => { mainWindow.close() })
  mainWindow.loadFile("log.html");
  ipcMain.once('closed', () => {
    mainWindow.loadFile('loading.html')
  })
  ipcMain.once('jump', () => {
    mainWindow.hide()
    UIWindow()
    mainWindow.close()
  })
  ipcMain.on('reg', () => {
    regWindow()
  })
  global.sharedObject = {
    chat: null
  }

}
function regWindow() {
  const regwindow = new BrowserWindow({
    width: 450,
    height: 250,
    resizable: false,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      enableBlinkFeatures: true,
      enableWebSQL: true
    }
  })
  regwindow.loadFile('reg.html')
  ipcMain.on('closereg', () => {
    regwindow.close();
  })
}
function UIWindow() {
  const uiWindow = new BrowserWindow({
    width: 870,
    height: 720,
    resizable: true,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      enableBlinkFeatures: true,
      enableWebSQL: true
    }
  });
  uiWindow.loadFile("ui.html");
  ipcMain.on('minimize', () => {
    uiWindow.minimize()
  })
  ipcMain.on('maximize', () => {
    if (uiWindow.isMaximized()) {
      uiWindow.restore();
    }
    else uiWindow.maximize()
  })
  ipcMain.on('close', () => {
    uiWindow.close()
  })
  ipcMain.on('add', () => {
    const child = new BrowserWindow({
      parent: uiWindow,
      modal: true,
      show: true,
      width: 450,
      height: 300,
      resizable: false,
      frame: false,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true
      }
    })
    child.loadFile('add.html')
    ipcMain.on('addfff', (event, obj) => {
      uiWindow.webContents.send('addfff', obj)
    })

  })
}
app.on("closed", function () {
  mainWindow = null;
});
app.whenReady().then(() => {
  createWindow();
  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0)
      createWindow();
  });
})
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});
