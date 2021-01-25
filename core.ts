import {hexStrToBytes} from "./encode.js";
/// <reference types="./lib/cryptico" />

export {ChatApp}

interface SendMessage {
    type: string,
    sender: string,
    recipient: string,
    text: string
}

interface Address {
    id: string,
    alisa: string
}

interface Group {
    id: string,
    D: string,
    alisa: string
}

interface UserInf {
    D: string,
    friends: Address[],
    groups: Group[]
}

class ChatApp {
    addFriend(id: string, alisa?: string) {
        this.userInf.friends.push({
            id: id,
            alisa: alisa
        });
        this.syncStorage();
    }

    removeFriend(id: string) {
        this.userInf.friends = this.userInf.friends.filter(f => f.id != id);
        this.syncStorage();
    }

    joinGroup(id: string, D: string, alisa?: string) {
        this.userInf.groups.push({
            id: id,
            D: D,
            alisa: alisa
        })
        this.syncStorage();
    }

    leaveGroup(id: string) {
        this.userInf.groups = this.userInf.groups.filter(g => g.id != id);
        this.syncStorage();
    }

    newGroup(): Group {
        // @ts-ignore
        let key = cryptico.generateRSAKey(new Date().getTime().toString(), 1024);
        let group: Group = {
            id: key.getPublicHex(),
            D: key.getPrivateHex(),
            alisa: ''
        }
        this.userInf.groups.push(group);
        this.syncStorage();
        return group;
    }

    ws: WebSocket
    onMessage: ((sender: string, recipient: string, text: string) => any) | null
    userId: string
    userAlisa: string
    userPassword: string
    // @ts-ignore
    rsaKey: RSAKey
    userInf: UserInf
    url: string

    constructor(url: string) {
        this.url = url;
    }

    login(id: string, password: string): boolean {
        this.userPassword = password;
        // @ts-ignore
        let key = Array.from(hexStrToBytes(cryptico.getMD5(password)));
        try {
            // @ts-ignore
            let userInf: UserInf = JSON.parse(cryptico.decryptAESCBC(<string>localStorage.getItem(id), key));
            if (userInf == null) {
                return false;
            }
            // @ts-ignore
            let rsa = new RSAKey();
            rsa.setPrivateHex(id, userInf.D);
            if (rsa.decrypt(rsa.encrypt("Check")) === "Check") {
                console.log("Auth Pass!")
                this.rsaKey = rsa;
                this.userInf = userInf;
                this.userId = id;
                this.userAlisa = ChatApp.allAccountInStorage().filter(u => u.id == id)[0].alisa
                this.initChat();
                return true;
            }
        } catch (e) {
        }
        return false;
    }

    static signup(alisa: string, password: string) {
        // @ts-ignore
        let key = cryptico.generateRSAKey(new Date().getTime().toString(), 1024);
        // @ts-ignore
        let aesKey = Array.from(hexStrToBytes(cryptico.getMD5(password)));
        let accounts: Address[] = JSON.parse(<string>localStorage.getItem("users"))
        if (accounts == null) {
            accounts = []
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
    }

    static allAccountInStorage(): Address[] {
        return JSON.parse(<string>localStorage.getItem("users"));
    }

    static loadAccount(id: string, inf: string, alisa: string) {
        if (id.length != 256) {
            return;
        }
        let accounts: Address[] = JSON.parse(<string>localStorage.getItem("users"))
        if (accounts == null) {
            accounts = []
        }
        accounts.push({
            id: id,
            alisa: alisa
        });
        localStorage.setItem("users", JSON.stringify(accounts));
        localStorage.setItem(id, inf);
    }

    exportAccount(): string {
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
            }))
            if (this.userInf.friends == null) {
                this.userInf.friends = []
            }
            if (this.userInf.groups == null) {
                this.userInf.groups = []
            }
            this.userInf.groups.forEach(group => {
                this.ws.send(JSON.stringify({
                    type: "listen",
                    id: group.id
                }))
            })
        }

        this.ws.onmessage = evt => {
            var message: SendMessage = JSON.parse(evt.data);
            console.log("New Received Message From " + message.sender);
            if (this.onMessage) {
                this.onMessage(message.sender, message.recipient, this.rsaKey.decrypt(message.text));
            }
        }
    }

    syncStorage() {
        // @ts-ignore
        let key = Array.from(hexStrToBytes(cryptico.getMD5(this.userPassword)));
        // @ts-ignore
        localStorage.setItem(this.userId, cryptico.encryptAESCBC(JSON.stringify(this.userInf), key));
    }

    send(recipient: string, text: string): void {
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