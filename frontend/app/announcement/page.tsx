'use client'
import { useEffect, useRef, useState } from "react"
import ImagePage from "./components/ImagePage"
import { getSocket } from "../../lib/socket"
import "dotenv/config"

import dynamic from "next/dynamic";
import ListeningComponent from "./components/ListeningComponent"

import axios from "axios"
import { SpeechRecognizer } from "../../lib/SpeechRecognizer"

const FaceDetectorComponent = dynamic(
  () => import("./components/FaceDetectorComponent"),
  { ssr: false }
);

type MessageData = {
  id: number,
  imagesList: Array<string>,
  text: string
}
const loadAudio = async (speechData: ArrayBuffer) => {
  const audioCtx = new window.AudioContext();

  const decodedData = await audioCtx.decodeAudioData(speechData);

  const source = audioCtx.createBufferSource();
  source.buffer = decodedData;
  source.connect(audioCtx.destination);
  source.start(0);
}

const AnnouncementPage = () => {
  const [showStartButton, setShowStartButton] = useState(true)
  const [imagesList, setImagesList] = useState<string[]>([])

  const speechRef = useRef<SpeechRecognizer | null>(null)

  const speechMessageRef = useRef<string | null>(null)
  const isListeningRef = useRef<boolean>(false)
  const [speechMessage, setSpeechMessage] = useState<string>("")

  const [isListening, setIsListening] = useState<boolean>(false)

  const stopSpeechTimeout = useRef<NodeJS.Timeout | null>(null)

  const setupSpeechRecognizer = async () => {

    speechRef.current = new SpeechRecognizer()
    console.log("LOaded!!")
    speechRef.current?.onTranscript((text: string) => {

      console.log("New text:", text)
      speechMessageRef.current = text

      setSpeechMessage(speechMessageRef.current)
      console.log("Current message:", speechMessageRef.current)
    })

    speechRef.current?.onInterim((text) => {
      console.log("Interim:", text)
      clearStopSpeechTimeout()
      loadStopSpeectTimeout()
    })
  }

  const loadSocket = () => {
    const socket = getSocket()

    socket.on("new-message", async (messageData: MessageData) => {
      console.log("new message:", messageData)
      const newImageList = messageData.imagesList.map((image) => {
        return process.env.NEXT_PUBLIC_API_URL + "/api/announcements" + image
      })

      setImagesList(newImageList)
    })

    socket.on("new-speech", async (speechData) => {
      await loadAudio(speechData)
    })

    return socket
  }

  const clearStopSpeechTimeout = () => {
    if (stopSpeechTimeout.current) {
      clearTimeout(stopSpeechTimeout.current)
    }
  }

  const handleFaceEnter = () => {
    clearStopSpeechTimeout()
    console.log("Face enter")
    if (!isListeningRef.current) {
      if (!speechRef.current?.isStarted()) {
        speechRef.current?.start()

      }
      isListeningRef.current = true
      setIsListening(true)
    }
  }

  const loadStopSpeectTimeout = () => {
    stopSpeechTimeout.current = setTimeout(() => {
      speechRef.current?.stop()
      speechMessageRef.current = ""
      setIsListening(false)
      isListeningRef.current = false
      setSpeechMessage("")

      console.log("stop time out!!")
    }, 5000);
  }

  const handleFaceLeave = () => {
    if (!isListeningRef.current) {
      clearStopSpeechTimeout()
      loadStopSpeectTimeout()
    }

  }

  useEffect(() => {

    setupSpeechRecognizer()

    const socket = loadSocket()

    return () => {
      socket.off("new-message")
      socket.off("new-speech")
    }
  }, [])


  return (
    <>

      <FaceDetectorComponent
        onFaceEnter={handleFaceEnter}

        onFaceLeave={handleFaceLeave}
      />
      {isListening &&
        <ListeningComponent text={speechMessage} />

      }
      <div className="">
        {showStartButton &&
          <button onClick={() => setShowStartButton(false)} className="w-screen h-screen text-primary font-bold text-2xl bg-white text-center z-2 fixed cursor-pointer">กดเพื่อเริ่มต้นการใช้งาน</button>
        }
        <div className="fixed bg-white cursor-pointer" >
          <button onClick={() => speechRef.current?.start()} >Start</button>
          <button onClick={() => speechRef.current?.stop()}>Stop</button>
        </div>
        <ImagePage imagesList={imagesList} />
        {/* <ImagePage imagesList={imagesList} /> */}

      </div>
    </>

  )
}
export default AnnouncementPage