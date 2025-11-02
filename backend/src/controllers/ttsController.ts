import { getIo } from "../io"
import { convertTextToSpeech } from "../services/ttsService"

export type SpeechConfig = {
    repeatCount: number,
    repeatDelaySeconds: number
}

export const sendSpeech = async (context: string, text: string, config?: SpeechConfig) => {
    const io = getIo()
    io.emit("sendSpeechMessageToClient", context, text, config)
}

export const sentSpeechMessageToClient = async (context: string, text: string, config?: SpeechConfig) => {
    const [speechAudio, error] = await convertTextToSpeech(text)
    const io = getIo()

    if (!speechAudio) {
        console.error("Cannot get the TTS Audio.", error)

        io.emit(context, false, error)
        return false
    }

    io.emit(context, speechAudio, config)
}

