'use client'

import { useEffect } from "react"
import { getSocket } from "../../../lib/socket"
import AudioBufferQueue from "../../../lib/AudioBufferQueue";

type SpeechType = "announcement" | "answer"
type MessageType = "announcement" | "answer"

interface Props {
    onSpeechSuccess: (speechType: SpeechType) => void,

    onMessageAdded: (messageType: MessageType) => void,
    canSpeechPassCheck: (messageType: MessageType) => boolean
}

type SpeechConfig = {
    repeatCount?: number,
    repeatDelaySeconds?: number
}


const speechContextList = {
    announcementSpeech: "announcementSpeech",
    answerSpeech: "answerSpeech"
}


const SpeechComponent = ({ onSpeechSuccess, onMessageAdded, canSpeechPassCheck }: Props) => {
    useEffect(() => {
        const audioBufferQueue = new AudioBufferQueue()
        const socket = getSocket()


        audioBufferQueue.createQueue(speechContextList.announcementSpeech, () => {
            onSpeechSuccess("announcement")
        })

        audioBufferQueue.createQueue(speechContextList.answerSpeech, () => {
            onSpeechSuccess("answer")
        })

        socket.on(speechContextList.announcementSpeech, async (speechData, speechConfig?: SpeechConfig) => {
            console.log("Test1")
            if (!speechData) {
                console.error(speechConfig)
                onMessageAdded("announcement")
                onSpeechSuccess("announcement")
                return false
            }
            if (!canSpeechPassCheck("announcement")) return false

            console.log("Speech data:", speechData)
            const repeatCount = speechConfig?.repeatCount || 1
            const repeatDelaySeconds = speechConfig?.repeatDelaySeconds || 1

            onMessageAdded("announcement")

            audioBufferQueue.addQueue(
                speechContextList.announcementSpeech,
                speechData,
                {
                    repeatCount: repeatCount,
                    repeatDelaySeconds: repeatDelaySeconds
                }
            )

            audioBufferQueue.cancelCurrentQueue(speechContextList.answerSpeech)
        })

        socket.on(speechContextList.answerSpeech, async (speechData, speechConfig?: SpeechConfig) => {
            console.log("Test2")
            if (!speechData) {
                console.error(speechConfig)
                onMessageAdded("answer")
                onSpeechSuccess("answer")
                return false
            }

            if (!canSpeechPassCheck("answer")) return false
            const repeatCount = speechConfig?.repeatCount || 1
            const repeatDelaySeconds = speechConfig?.repeatDelaySeconds || 1

            onMessageAdded("answer")

            audioBufferQueue.addQueue(
                speechContextList.answerSpeech,
                speechData,
                {
                    repeatCount: repeatCount,
                    repeatDelaySeconds: repeatDelaySeconds
                }
            )
        })

        return () => {
            audioBufferQueue.destroy()
            socket.off(speechContextList.announcementSpeech)
            socket.off(speechContextList.answerSpeech)
        }
    }, [])
    return null
}
export default SpeechComponent