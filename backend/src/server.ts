// server.js
import express, { type Request, type Response } from "express";
import next from "next";


import { createServer } from "http"
import { initIo } from "./io";
import announcementRoute from "./routes/announcementRoute";
import path from "path";

import "dotenv/config"
import { syncAllCurrentAnnouncement } from "./services/announcementService";
import getServerIp from "./lib/getServerIp";
import { onMessageAdd, setupAsrSocket, startAsr, stopAsr } from "./services/asrService";

const routes = {
    announcementRoute
};



const dev = process.env.NODE_ENV !== "production"
const frontendDir = path.resolve(__dirname, "../../frontend")
const nextApp = next({ dev, dir: frontendDir, turbo: true })
const handle = nextApp.getRequestHandler()

nextApp.prepare().then(() => {
    const expressApp = express()
    const server = createServer(expressApp)
    const io = initIo(server)

    expressApp.use(express.json());
    expressApp.use(express.urlencoded({ extended: true }));

    // Routes
    expressApp.use("/api/announcements", routes.announcementRoute)

    // --- Next.js setup ---
    expressApp.post("/api/send-message", (request: Request, response: Response) => {
        const message = request.body
        // handleSendMessage(message)
        response.status(200).json({ success: true })
    })

    setupAsrSocket()

    // --- Socket.IO setup ---
    io.on("connection", async (socket) => {
        console.log("✅ User connected:", socket.id)
        const serverIp = getServerIp()



        socket.emit("socket-connected", serverIp)

        socket.on("disconnect", async () => {
            console.log("Client disconnected:", socket.id);
        });
    })

    io.of("/asr").on("connection", (socket) => {
        console.log("Web client connected");

        const connection = onMessageAdd((message) => {
            console.log("Asr from server:", message)
            socket.emit("message", message)
        })

        socket.on("start", () => {
            startAsr()
        })

        socket.on("stop", () => {
            stopAsr()
        })

        socket.on("disconnect", async () => {
            console.log("Client disconnected:", socket.id);
            connection.disconnect()

        });

    })


    // expressApp.all(/^(?!\/api\/).*$/, (req, res) => handle(req, res));
    // expressApp.use((req, res) => handle(req, res))


    syncAllCurrentAnnouncement()


    expressApp.use((req, res) => handle(req, res));

    const serverPort = process.env.PORT
    server.listen(serverPort, () => {
        console.log("Server address:", getServerIp());
        console.log(`> 🚀 Server ready on http://localhost:${serverPort}`)
    })
})


// })


