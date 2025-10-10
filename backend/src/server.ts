// server.js
import express, { type Request, type Response } from "express";
import cors from "cors";

import { createServer } from "http";
import { initIo } from "./io";
import announcementRoute from "./routes/announcementRoute";
import esp32Route from "./routes/esp32Route"

import os from "os"

import "dotenv/config"
import { syncAllCurrentAnnouncement } from "./services/announcementService";

const routes = {
    announcementRoute, esp32Route
};

const expressApp = express()
const server = createServer(expressApp)
const io = initIo(server)

const ASSEMBLYAI_KEY = process.env.ASSEMBLYAI_API_KEY as string

console.log("ASSEMBLY API KEY:", ASSEMBLYAI_KEY)

// Middleware
expressApp.use(cors({
    // origin: process.env.FRONTEND_URL,
    origin: "*",
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}))
expressApp.use(express.json())
// Routes
expressApp.use("/api/esp32", routes.esp32Route)
expressApp.use("/api/announcements", routes.announcementRoute)

// --- Next.js setup ---
expressApp.post("/api/send-message", (request: Request, response: Response) => {
    const message = request.body
    // handleSendMessage(message)
    response.status(200).json({ success: true })
})


function getLocalIP() {
    const nets = os.networkInterfaces();
    for (const details of Object.values(nets)) {
        if (details) {
            for (const detail of details) {
                if (detail.family === "IPv4" && !detail.internal) {
                    return detail.address;
                }
            }
        }

    }
    return "127.0.0.1";
}

// --- Socket.IO setup ---
io.on("connection", async (socket) => {
    console.log("✅ User connected:", socket.id)
    const serverIp = getLocalIP()
    socket.emit("load-server-ip", serverIp)

    socket.on("disconnect", async () => {
        console.log("Client disconnected:", socket.id);
    });
})


// expressApp.all(/^(?!\/api\/).*$/, (req, res) => handle(req, res));
// expressApp.use((req, res) => handle(req, res))

// syncAllCurrentAnnouncement()



server.listen(5000, () => {
    const address = server.address();
    console.log("Server address:", getLocalIP());
    console.log("> 🚀 Server ready on http://localhost:5000")
})
// })


export default expressApp