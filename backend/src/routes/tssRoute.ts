import type { Request, Response } from "express"
import express from "express"
import { convertTextToSpeech } from "../services/ttsService"

const router = express.Router()

router.post("/tts-request", async (request: Request, response: Response) => {
    const text = request.body.text
    const [arrayBuffer, error] = await convertTextToSpeech(text)
    
    if (!arrayBuffer) {

        response.status(500).json({ error: "convert text error", message: error })
        return false
    }

    response.setHeader("Content-Type", "application/octet-stream")
    response.setHeader("Content-Length", arrayBuffer.byteLength)
    response.send(arrayBuffer)
})

export default router