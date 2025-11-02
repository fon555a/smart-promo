import { io, Socket } from "socket.io-client";

const socketList: {[k: string]: Socket} = {
    default: null,
    asr: null
}

const domain = process.env.NEXT_PUBLIC_DOMAIN_URL

export const getSocket = (namespace="default") => {
    let url

    if (namespace === "default") {
        url = domain
    } else {
        url = domain + (namespace ? `/${namespace}` : "");
    }

    if (!socketList[namespace]) {
        socketList[namespace] = io(url)
    }

    console.log("socketList", socketList)

    return socketList[namespace]
}