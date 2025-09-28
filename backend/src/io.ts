import { Server, type DefaultEventsMap } from "socket.io"
import { Server as HttpServer } from "http"

let io: Server | null = null

export const initIo = (server: HttpServer) => {
    io = new Server(server, {
        cors: {
            origin: [
                process.env.FRONTEND_URL as string,
                "http://localhost:3000"
            ],
            methods: ["GET", "POST"]
        },
        
    })

    console.log("Io changed!!")

    return io
}

export const getIo = () => {
    if (!io) {
        throw new Error("Socket.IO not initialized")
    }

    return io
}