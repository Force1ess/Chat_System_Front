var { ipcRenderer } = require('electron')
const win = require('electron').remote.getCurrentWindow()
setTimeout(() => {
    ipcRenderer.send('jump')
}, 500);
