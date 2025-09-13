import { io, Socket } from "socket.io-client";

let socket: Socket | null

export const getSocket = () => {
    if (!socket) {
        socket = io("http://localhost:3000")
    }

    return socket
}