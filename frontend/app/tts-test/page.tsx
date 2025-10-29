'use client'

import { useEffect, useRef } from "react";

const TTSTest = () => {

    const inputRef = useRef<HTMLInputElement>(null)
    
    useEffect(() => {
        speechSynthesis.getVoices().forEach(v => console.log(v.name, v.lang))
    }, [])
    const startSpeaking = (text: string) => {
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = "th-TH";
        speechSynthesis.speak(utter);
    }

    const onSubmit = () => {
        const text = inputRef.current.value
        console.log("Text:", text)
        startSpeaking(text)
    }
    return (
        <div>
            <form action="">
                <input type="text" ref={inputRef} />
                <button type="button" onClick={onSubmit}>เริ่มพูด</button>
            </form>
        </div>
    )
}
export default TTSTest