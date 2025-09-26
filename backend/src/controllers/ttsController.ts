import { getIo } from "../io"
import { convertTextToSpeech } from "../services/ttsService"

export type SpeechConfig = {
    repeatCount: number,
    repeatDelaySeconds: number
} 

export const sentSpeechMessageToClient = async (context: string, text: string, config?: SpeechConfig) => {
    const speechAudio = await convertTextToSpeech(text)

    if (!speechAudio) {
        console.error("Cannot get the TTS Audio.")
        return false
    }

    const io = getIo()
    io.emit(context, speechAudio, config)
}

