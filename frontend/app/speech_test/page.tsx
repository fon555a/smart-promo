'use client'
import { useEffect, useRef, useState } from "react"
import { SpeechRecognizer } from "../../lib/SpeechRecognizer"

const SpeechTestPage = () => {
    const [transcript, setTranscript] = useState("")
    const newSpeechRef = useRef<SpeechRecognizer>(null)

    useEffect(() => {
        
        newSpeechRef.current = new SpeechRecognizer()

        newSpeechRef.current?.onTranscript((text: string) => {
            setTranscript(text)
        })
    }, [])

    return (
        <div>
            <p>ข้อความ: {transcript}</p>
            <button onClick={() => newSpeechRef.current?.start()}>เริ่ม</button>
            <button onClick={() => newSpeechRef.current?.stop()}>หยุด</button>
        </div>
    )
}
export default SpeechTestPage