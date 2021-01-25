var { ipcRenderer } = require("electron");
const win = require("electron").remote.getCurrentWindow();
function Verify() {
  var id = document.getElementById("a").value;
  var password = document.getElementById("b").value;
  if (ChatApp.auth(id, password)) {
    ipcRenderer.send("closed");
  } else {
    alert('错误')
  }
}
function close() {
  ipcRenderer.send("quit");
}
function Register() {
  ipcRenderer.send("reg")
}