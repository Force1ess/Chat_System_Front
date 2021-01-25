var { ipcRenderer } = require("electron");
function clo() {
    javascript: window.opener = null;
    window.open('', '_self');
    window.close();
}
var param = localStorage.getItem("key1")
var con = new Vue({
    el: '#ad',
    data: {
        message: param
    }
})
function addfri() {
    ipcRenderer.send('addfff', {
        id: document.getElementById('addf').value,
        alisa: document.getElementById('ali').value
    })
    clo()
}