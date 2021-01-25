
class ChatApp {
    constructor(url) {
        this.url = url;
    }
    addFriend(id, alisa) {
        this.userInf.friends.push({
            id: id,
            alisa: alisa
        });
        this.syncStorage();
    }
    removeFriend(id) {
        this.userInf.friends = this.userInf.friends.filter(f => f.id != id);
        this.syncStorage();
    }
    joinGroup(id, D, alisa) {
        this.userInf.groups.push({
            id: id,
            D: D,
            alisa: alisa
        });
        this.syncStorage();
    }
    leaveGroup(id) {
        this.userInf.groups = this.userInf.groups.filter(g => g.id != id);
        this.syncStorage();
    }
    newGroup() {
        // @ts-ignore
        let key = cryptico.generateRSAKey(new Date().getTime().toString(), 1024);
        let group = {
            id: key.getPublicHex(),
            D: key.getPrivateHex(),
            alisa: ''
        };
        this.userInf.groups.push(group);
        this.syncStorage();
        return group;
    }
    static auth(id, password) {
        // @ts-ignore
        let key = Array.from(hexStrToBytes(cryptico.getMD5(password)));
        try {
            // @ts-ignore
            let userInf = JSON.parse(cryptico.decryptAESCBC(localStorage.getItem(id), key));
            if (userInf == null) {
                return false;
            }
            // @ts-ignore
            let rsa = new RSAKey();
            rsa.setPrivateHex(id, userInf.D);
            if (rsa.decrypt(rsa.encrypt("Check")) === "Check") {
                console.log("Auth Pass!");
                localStorage.setItem("login", JSON.stringify({ id: id, pw: password }))
                return true;
            }
        }
        catch (e) {
            console.log(e)
        }
        return false;
    }
    loginInStorage() {
        let log = JSON.parse(localStorage.getItem("login"));
        localStorage.removeItem("login");
        this.login(log.id, log.pw);
    }
    login(id, password) {
        this.userPassword = password;
        // @ts-ignore
        let key = Array.from(hexStrToBytes(cryptico.getMD5(password)));
        try {
            // @ts-ignore
            let userInf = JSON.parse(cryptico.decryptAESCBC(localStorage.getItem(id), key));
            if (userInf == null) {
                return false;
            }
            // @ts-ignore
            let rsa = new RSAKey();
            rsa.setPrivateHex(id, userInf.D);
            if (rsa.decrypt(rsa.encrypt("Check")) === "Check") {
                console.log("Auth Pass!");
                this.rsaKey = rsa;
                this.userInf = userInf;
                this.userId = id;
                this.userAlisa = ChatApp.allAccountInStorage().filter(u => u.id == id)[0].alisa;
                this.initChat();
                return true;
            }
        }
        catch (e) {
            console.log(e)
        }
        return false;
    }
    getMyId() {
        return this.userId;
    }
    getMyAlisa() {
        return this.userAlisa;
    }
    static signup(alisa, password) {
        // @ts-ignore
        let key = cryptico.generateRSAKey(new Date().getTime().toString(), 1024);
        // @ts-ignore
        let aesKey = Array.from(hexStrToBytes(cryptico.getMD5(password)));
        let accounts = JSON.parse(localStorage.getItem("users"));
        if (accounts == null) {
            accounts = [];
        }
        accounts.push({
            id: key.getPublicHex(),
            alisa: alisa
        });
        localStorage.setItem("users", JSON.stringify(accounts));
        // @ts-ignore
        localStorage.setItem(key.getPublicHex(), cryptico.encryptAESCBC(JSON.stringify({
            D: key.getPrivateHex(),
            friends: [],
            group: []
        }), aesKey));
alert('Your ID is:'+key.getPublicHex())
    }
    static allAccountInStorage() {
        return JSON.parse(localStorage.getItem("users"));
    }
    static loadAccount(id, inf, alisa) {
        if (id.length != 256) {
            return;
        }
        let accounts = JSON.parse(localStorage.getItem("users"));
        if (accounts == null) {
            accounts = [];
        }
        accounts.push({
            id: id,
            alisa: alisa
        });
        localStorage.setItem("users", JSON.stringify(accounts));
        localStorage.setItem(id, inf);
    }
    exportAccount() {
        return JSON.stringify({
            id: this.userId,
            inf: localStorage.getItem(this.userId),
            alisa: this.userAlisa
        });
    }
    initChat() {
        this.ws = new WebSocket(this.url);
        this.ws.onopen = evt => {
            console.log("Connection open ...");
            this.ws.send(JSON.stringify({
                type: "listen",
                id: this.userId
            }));
            if (this.userInf.friends == null) {
                this.userInf.friends = [];
            }
            if (this.userInf.groups == null) {
                this.userInf.groups = [];
            }
            this.userInf.groups.forEach(group => {
                this.ws.send(JSON.stringify({
                    type: "listen",
                    id: group.id
                }));
            });
        };
        this.ws.onmessage = evt => {
            var message = JSON.parse(evt.data);
            console.log("New Received Message From " + message.sender);
            if (this.onMessage) {
                this.onMessage(message.sender, message.recipient, this.rsaKey.decrypt(message.text));
            }
        };
    }
    syncStorage() {
        // @ts-ignore
        let key = Array.from(hexStrToBytes(cryptico.getMD5(this.userPassword)));
        // @ts-ignore
        localStorage.setItem(this.userId, cryptico.encryptAESCBC(JSON.stringify(this.userInf), key));
    }
    send(recipient, text) {
        // @ts-ignore
        let key = new RSAKey();
        key.setPublicHex(recipient);
        this.ws.send(JSON.stringify({
            type: "send",
            sender: this.userId,
            recipient: recipient,
            text: key.encrypt(text)
        }));
    }
}
