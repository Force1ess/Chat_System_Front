var { ipcRenderer } = require("electron");
var win = require("electron").remote.getCurrentWindow();
var remote = require("electron").remote;
var { BrowserWindow } = require('electron')
var chat = new ChatApp("ws://127.0.0.1:5950/chat");
chat.loginInStorage();
chat.onMessage = (sender, recipient, text) => {
  vm.damnMessage.push({
    sender:sender,
    recipient:recipient,
    text:text
  })
}
document.getElementById('fir').src = textToImg([40, 40], chat.getMyAlisa())
var myid = chat.userId
localStorage.setItem("key1", chat.userId);
//chat.userInf.friends: { id: string, alisa: string } []
var obj =
  function minimize() {
    ipcRenderer.send("minimize");
  }
ipcRenderer.on('addfff', (event, obj) => {
  chat.addFriend(obj.id, obj.alisa)
  vm.friends=chat.userInf.friends
})
var vm = new Vue({
  el: '#coo',
  data: {
    sender: chat.userId,
    message: "   Hello  " + chat.getMyAlisa(),
    seen: false,
    alisa: chat.myAlisa,
    friends: chat.userInf.friends,
    senid: '',
    sendalisa: '',
    damnMessage:[]
  },
  computed: {
    date: function () {
      var data = new Date()
      return data.getDate() + "日" + data.getHours() + "时" + data.getMinutes() + "分"
    }
  },
  methods: {
    send: function () {
      chat.send(this.senid, document.getElementById('in').value)
      this.damnMessage.push({
        sender:this.sender,
        recipient:this.senid,
        text:document.getElementById('in').value
      })
      document.getElementById('in').value = ''
    },
    add: function () {
      ipcRenderer.send('add')
    },
    del: function () {
      chat.removeFriend(this.senid)
      this.friends=chat.userInf.friends
    },
    swi: function (seid, sealisa) {
      this.seen = true
      this.sendalisa = sealisa
      this.senid = seid
      this.message = "   " + sealisa
    },
    textToImg: function (size, s) {
      let colors = [
        "rgb(239,150,26)", 'rgb(255,58,201)', "rgb(111,75,255)", "rgb(36,174,34)", "rgb(80,80,80)"
      ];
      let cvs = document.createElement("canvas");
      cvs.setAttribute('width', size[0]);
      cvs.setAttribute('height', size[1]);
      let ctx = cvs.getContext("2d");
      ctx.fillStyle = colors[Math.floor(Math.random() * (colors.length))];
      ctx.fillRect(0, 0, size[0], size[1]);
      ctx.fillStyle = 'rgb(255,255,255)';
      ctx.font = size[0] * 0.6 + "px Arial";
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      ctx.fillText(s, size[0] / 2, size[1] / 2);

      return cvs.toDataURL('image/jpeg', 1);
    }

  }
})
function maximize() {
  ipcRenderer.send("maximize");
  if (ipcRenderer.on('yes'))
    document.getElementById('max').src = '还原.PNG';
  else
    document.getElementById('max').src = '最大化.PNG';

}
function close() {
  ipcRenderer.send("close");
}
function invite() {
  ipcRenderer.send('invite')
}

function textToImg(size, s) {
  let colors = [
    "rgb(239,150,26)", 'rgb(255,58,201)', "rgb(111,75,255)", "rgb(36,174,34)", "rgb(80,80,80)"
  ];
  let cvs = document.createElement("canvas");
  cvs.setAttribute('width', size[0]);
  cvs.setAttribute('height', size[1]);
  let ctx = cvs.getContext("2d");
  ctx.fillStyle = colors[Math.floor(Math.random() * (colors.length))];
  ctx.fillRect(0, 0, size[0], size[1]);
  ctx.fillStyle = 'rgb(255,255,255)';
  ctx.font = size[0] * 0.6 + "px Arial";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillText(s, size[0] / 2, size[1] / 2);

  return cvs.toDataURL('image/jpeg', 1);
}