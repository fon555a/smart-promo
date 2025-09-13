import { Server } from "socket.io"

let io = null

export const initIo = (server) => {
    io = new Server(server, {
        cors: {origin: "*"}
    })

    console.log("Io changed!!")

    return io
}

export const getIo = () => {
    console.log("IO:", io)
    if (!io) {
        throw new Error("Socket.IO not initialized")
    }

    return io
}