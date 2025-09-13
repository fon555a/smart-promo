// server.js
const express = require("express")
const { createServer } = require("http")
const { Server } = require("socket.io")
const next = require("next")
const { initIo, getIo } = require("./lib/io.js")
const dayjs = require("dayjs")


const dev = process.env.NODE_ENV !== "production"
const app = next({ dev })
const handle = app.getRequestHandler()

const expressApp = express()
const server = createServer(expressApp)
const io = initIo(server)

const handleSendMessage = (message) => {
    const now = Date.now()

    const startTime = dayjs(message.startTime)
    const endTime = dayjs(message.endTime)

    const startDelay = startTime.valueOf() - now
    const endDelay = endTime.valueOf() - now

    const io = getIo()

    console.log("Start delay:", startDelay)
    console.log("End delay:", endDelay)

    if (startDelay > 0) {

        // setTimeout(() => {
        //     io.emit("new-message", message)
        // }, startDelay);
        io.emit("new-message", message)

    } else {
        io.emit("new-message", message)
    }

    if (endDelay > 0) {
        setTimeout(() => {
            io.emit("remove-message", message)
        }, endDelay);
    }
}

app.prepare().then(() => {


    // --- Socket.IO setup ---
    io.on("connection", (socket) => {
        console.log("✅ User connected:", socket.id)



        socket.on("disconnect", () => {
            console.log("❌ User disconnected:", socket.id)
        })
    })

    // --- Next.js setup ---
    expressApp.use(express.json())

    expressApp.post("/api/send-message", (request, response) => {
        const message = request.body
        console.log("Message:", message)
        handleSendMessage(message)
        response.status(200).json({ success: true })
    })


    expressApp.use((req, res) => handle(req, res))

    server.listen(3000, () => {
        console.log("> 🚀 Server ready on http://localhost:3000")
    })
})

