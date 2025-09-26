'use client'
import { useEffect } from "react"
import AudioBufferQueue from "../../lib/AudioBufferQueue"
import { getSocket } from "../../lib/socket"
import axios from "axios"

import "dotenv/config"

const TestPage = () => {
    
    const testSentData = async () => {
        await axios.post(process.env.NEXT_PUBLIC_API_URL + "/api/announcements/ask_announcement", {
            test: "สวัสดี อยากถามเรื่องประชาสัมพันธ์สักหน่อย"
        })
    }

    useEffect(() => {
        const audioBufferQueue = new AudioBufferQueue()
        audioBufferQueue.onSuccess = () => {
            console.log("พูดเสร็จละ มุฮาฮา")
        }
        const socket = getSocket()

        socket.on("new-speech", async (speechData) => {
            audioBufferQueue.addQueue(speechData)
        })

        return () => {
            audioBufferQueue.destroy()
        }
    }, [])
    return (
        <div>
            <button onClick={testSentData}>Click me</button>

        </div>
    )
}
export default TestPage