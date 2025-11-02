'use client'

import { useEffect, useRef, useState } from "react"
import { SpeechRecognizer } from "../../lib/SpeechRecognizer"

const AsrTestPage = () => {
    const speechRef = useRef<SpeechRecognizer | null>(null)
    const [text, setText] = useState()

    useEffect(() => {
        speechRef.current = new SpeechRecognizer()

        speechRef.current.onTranscript((text) => {
            setText(text)
        })
    }, [])
    return (
        <div>
            <h1>{text}</h1>
            <button onClick={() => speechRef.current?.start()}>start</button>
            <button onClick={() => speechRef.current?.stop()}>stop</button>
        </div>
    )
}
export default AsrTestPage