// server.js
import express, { type Request, type Response } from "express";
import cors from "cors";

import { createServer } from "http";
import { initIo } from "./io";
import announcementRoute from "./routes/announcementRoute";

import "dotenv/config"
import { syncAllCurrentAnnouncement } from "./services/announcementService";

const routes = {
    announcementRoute
};
console.log("Routes:", routes)

const expressApp = express()
const server = createServer(expressApp)
const io = initIo(server)

// Middleware
expressApp.use(cors({ 
    // origin: process.env.FRONTEND_URL,
    origin: "*",
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
 }))
expressApp.use(express.json())
// Routes
expressApp.use("/api/announcements", routes.announcementRoute)

// --- Next.js setup ---
expressApp.post("/api/send-message", (request: Request, response: Response) => {
    const message = request.body
    console.log("Message:", message)
    // handleSendMessage(message)
    response.status(200).json({ success: true })
})



// --- Socket.IO setup ---
io.on("connection", (socket) => {
    console.log("✅ User connected:", socket.id)

    // addSteamingConnection(socket, (text: string) => {
    //     console.log("Full text:", text)
    // })

    socket.on("disconnect", () => {
        console.log("❌ User disconnected:", socket.id)
    })

    socket.on("message", (data) => {
        const parsed = typeof data === "string" ? JSON.parse(data) : data;
        console.log("Message-data:", data)
        // if (parsed.event === "distance-update") {
        //     io.emit("distance-update", parsed.distance);
        // }
    });
})

// expressApp.all(/^(?!\/api\/).*$/, (req, res) => handle(req, res));
// expressApp.use((req, res) => handle(req, res))

syncAllCurrentAnnouncement()

server.listen(5000, () => {
    console.log("> 🚀 Server ready on http://localhost:5000")
})
// })


export default expressApp