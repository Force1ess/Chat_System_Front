var { ipcRenderer } = require("electron");
const win = require("electron").remote.getCurrentWindow();
function clo() {
    javascript: window.opener = null; window.open('', '_self'); window.close();
}
function sub() {
    var id = document.getElementById('a').value
    var password = document.getElementById('b').value
    ChatApp.signup(id, password);
    clo()
}