import { io, Socket } from "socket.io-client";

let socket: Socket | null

const domain = process.env.NEXT_PUBLIC_DOMAIN_URL

export const getSocket = () => {

    if (!socket) {
        socket = io(domain)
    }

    return socket
}