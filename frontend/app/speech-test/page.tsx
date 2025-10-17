'use client'

import axios from "axios"
import { FormEvent, FormEventHandler, useEffect, useRef, useState } from "react"
import AudioBufferQueue from "../../lib/AudioBufferQueue"

const SpeechTest = () => {
    const valueRef = useRef("")
    const speechQueueRef = useRef<AudioBufferQueue>(null)

    const getSpeechData = async (text: string): Promise<false | ArrayBuffer> => {
        try {
            const response = await axios.post("/api/tts/tts-request", { text: text }, {
                responseType: "arraybuffer"
            })

            if (response.status !== 200) {
                console.error("Cannot get speech data:", response.data)
                return false
            }
            const arrayBuffer = response.data
            return arrayBuffer
        } catch (error) {
            if (error.response) {
                const decoder = new TextDecoder("utf-8")
                const jsonData = JSON.parse(decoder.decode(error.response.data))

                console.log("status:", error.response.status)        // 500
                console.log("body:", jsonData)            // JSON erroror จาก backend
            } else {
                console.log("network error:", error.message)
            }
        }

    }

    const handleOnSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const speechData = await getSpeechData(valueRef.current)

        if (!speechData) {
            console.log("Cannot get speech data.")
            return false
        }
        console.log(valueRef.current)

        speechQueueRef.current?.addQueue("answerSpeaking", speechData, {
            repeatCount: 1,
            repeatDelaySeconds: 0
        })
    }

    useEffect(() => {
        speechQueueRef.current = new AudioBufferQueue()

        speechQueueRef.current.createQueue("answerSpeaking", () => {
            console.log("Speech success")
        })
    }, [])

    return (
        <div>

            <form onSubmit={handleOnSubmit}>
                <label htmlFor="">ป้อนข้อความดู</label>
                <input type="text" className="bg-red-50" onChange={(event) => valueRef.current = event.target.value} />
            </form>
        </div>
    )
}
export default SpeechTest