'use client'

import { useEffect } from "react"
import { getSocket } from "../../../lib/socket"
import AudioBufferQueue from "../../../lib/AudioBufferQueue";
import wait from "../../../lib/wait";

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

const speechWithConfig = async (text: string, config: SpeechConfig) => {
    const repeatCount = config.repeatCount | 1
    const repeatDelaySeconds = config.repeatDelaySeconds

    for (let i = 0; i < repeatCount; i++) {
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = "th-TH";

        await new Promise((resolve) => {

            utter.onend = () => {
                resolve(null)
            }
            speechSynthesis.speak(utter);
        })
        
        if (repeatDelaySeconds) {
            wait(repeatDelaySeconds)
        }
    }

}

const SpeechComponent = ({ onSpeechSuccess, onMessageAdded, canSpeechPassCheck }: Props) => {
    useEffect(() => {

        const socket = getSocket()
        socket.on("sendSpeechMessageToClient", async (context: string, text: string, config: SpeechConfig) => {
            
            switch (context) {
                case speechContextList.announcementSpeech:
                    if (!canSpeechPassCheck("announcement")) return false
                    speechSynthesis.cancel()

                    onMessageAdded("announcement")
                    await speechWithConfig(text, config)
                    onSpeechSuccess("announcement")
                    break;
                case speechContextList.answerSpeech:
                    if (!canSpeechPassCheck("answer")) return false
                    onMessageAdded("answer")
                    await speechWithConfig(text, config)
                    onSpeechSuccess("answer")

                    break
            }
        })

        return () => {
            socket.off("sendSpeechMessageToClient")
        }
    }, [])
    return null
}
export default SpeechComponent