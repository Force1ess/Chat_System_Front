export {base64ToBytes, bytesToBase64, bytesToHexStr, hexStrToBytes}

function base64ToBytes(base64: string): Uint8Array {
    let binStr = atob(base64)
    let array = new Uint8Array(binStr.length)
    for (let i = 0; i < binStr.length; i++) {
        array[i] = binStr.charCodeAt(i)
    }
    return array;
}

function bytesToHexStr(bytes: Uint8Array): string {
    let hex = []
    for (let i = 0; i < bytes.length; i++) {
        hex.push((bytes[i] >>> 4).toString(16));
        hex.push((bytes[i] & 0xF).toString(16));
    }
    return hex.join("");
}

function hexStrToBytes(hexStr: string): Uint8Array {
    if (hexStr.length % 2 != 0) {
        hexStr = "0" + hexStr
    }
    let bytes = new Uint8Array(hexStr.length / 2);
    for (let c = 0; c < hexStr.length; c += 2)
        bytes[c / 2] = parseInt(hexStr.substr(c, 2), 16);
    return bytes;
}

function bytesToBase64(bytes: Uint8Array): string {
    let str = [];
    for (let i = 0; i < bytes.length; i++) {
        str.push(String.fromCharCode(bytes[i]))
    }
    return btoa(str.join(""));
}