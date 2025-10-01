import { io, Socket } from "socket.io-client";
import "dotenv/config"

let socket: Socket | null

// const backendUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL

export const getSocket = () => {

    if (!socket) {
        socket = io("ws://localhost:5000")
    }

    return socket
}