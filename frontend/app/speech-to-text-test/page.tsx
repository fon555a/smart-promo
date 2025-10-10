"use client";
import { useState } from "react";
import { Socket } from "socket.io-client";
import { Transcriber } from "../../lib/Transcriber";
import { getSocket } from "../../lib/socket";

export default function RecorderComponent() {
    const [text, setText] = useState<string>("");
    const [isRecording, setIsRecording] = useState<boolean>(false);

    // socket ของ Fon ที่มีอยู่แล้ว
    const socket: Socket = getSocket()

    // pass socket เข้าไป
    const transcriber = new Transcriber(socket);

    const handleStart = async () => {
        transcriber.onTranscription((newText: string) => setText(newText));
        await transcriber.start();
        setIsRecording(true);
    };

    const handleStop = () => {
        transcriber.stop();
        setIsRecording(false);
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-2">🎤 Real-time Transcription</h2>
            <button
                className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                onClick={isRecording ? handleStop : handleStart}
            >
                {isRecording ? "Stop" : "Start"}
            </button>
            <p className="mt-4 whitespace-pre-wrap">{text}</p>
        </div>
    );
}
