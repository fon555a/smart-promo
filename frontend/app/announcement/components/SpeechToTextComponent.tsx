import { useEffect, useRef } from "react"
import { SpeechRecognizer } from "../../../lib/SpeechRecognizer"


interface Props {
    onTranscript: (text: string) => void,
    onSpeechRecognizerAdded: (speechObject: SpeechRecognizer) => void
}
const SpeechToTextComponent = ({ onTranscript, onSpeechRecognizerAdded }: Props) => {
    const speechRef = useRef<SpeechRecognizer | null>(null)


    const setupSpeechRecognizer = async () => {

        speechRef.current = new SpeechRecognizer()
        console.log("LOaded!!")
        onSpeechRecognizerAdded(speechRef.current)
        speechRef.current?.onTranscript((text: string) => {

            console.log("New text:", text)
            onTranscript(text)
        })
    }

    useEffect(() => {
        setupSpeechRecognizer()
    }, [])
    return null
}
export default SpeechToTextComponent