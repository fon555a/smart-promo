import { io } from "socket.io-client"

import "dotenv/config"

type CallBackList = {
    message: Array<(message: { [k: string]: any }) => void>
}

let callBackList: CallBackList = {
    message: []
}

const socket = io(process.env.ASR_URL, {
    auth: { key: process.env.ASR_KEY }
});

console.log("Load asr!!")
export const onMessageAdd = (callBack: (message: { [k: string]: any }) => void) => {
    callBackList.message.push(callBack)

    const index = callBackList.message.length;
    return {
        disconnect: () => callBackList.message.splice(index, 1)
    }
}

export const stopAsr = () => {
    socket.emit("stop")
}

export const startAsr = () => {
    socket.emit("start")
}
export const setupAsrSocket = () => {



    socket.on("message", (message) => {
        console.log("Hell nah")
        for (const callBack of callBackList.message) {
            callBack(message)
        }
    })

}