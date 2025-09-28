'use client'
import { useEffect, useRef, useState } from "react"
import ImagePage from "./components/ImagePage"
import { getSocket } from "../../lib/socket"
import "dotenv/config"

import dynamic from "next/dynamic";
import ListeningComponent from "./components/ListeningComponent"

import { SpeechRecognizer } from "../../lib/SpeechRecognizer"
import SpeechComponent from "./components/SpeechComponent"
import SpeechToTextComponent from "./components/SpeechToTextComponent"
import axios from "axios"
import ProcessingComponent from "./components/ProcessingComponent"

const FaceDetectorComponent = dynamic(
  () => import("./components/FaceDetectorComponent"),
  { ssr: false }
);

type MessageData = {
  id: number,
  imagesList: Array<string>,
  text: string
}

const MAX_SPEECH_TIMEOUT = 5000

const AnnouncementPage = () => {
  
  const [showStartButton, setShowStartButton] = useState(true)
  const [imagesList, setImagesList] = useState<string[]>([])
  const [speechMessage, setSpeechMessage] = useState<string>("")
  const [isListening, setIsListening] = useState<boolean>(false)
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [isAnnounceing, setIsAnnouncing] = useState<boolean>(false)

  const speechRef = useRef<SpeechRecognizer | null>(null)
  const speechMessageRef = useRef<string | null>(null)
  const isListeningRef = useRef<boolean>(false)
  const stopSpeechTimeout = useRef<NodeJS.Timeout | null>(null)
  const isProcessingRef = useRef<boolean>(false)
  const isAnswerSpeakingRef = useRef<boolean>(false)
  const isAnnouncementSpeakingRef = useRef<boolean>(false)


  const loadSocket = () => {
    const socket = getSocket()

    socket.on("add-announcement", async (messageData: MessageData) => {
      console.log("new message:", messageData)
      const newImageList = messageData.imagesList.map((image) => {
        return process.env.NEXT_PUBLIC_API_URL + "/api/announcements" + image
      })

      setImagesList(newImageList)
    })

    socket.on("remove-current-announcement", () => {
      setImagesList([])
    })

    socket.on("distance-update", (distance: string) => {
      console.log("Distance update:", distance)
    })

    return socket
  }

  const clearStopSpeechTimeout = () => {
    if (stopSpeechTimeout.current) {
      clearTimeout(stopSpeechTimeout.current)
    }
  }

  const handleFaceEnter = () => {
    console.log("Face enter")
    if (isListeningRef.current) return false
    if (isProcessingRef.current) return false
    if (isAnswerSpeakingRef.current) return false
    if (isAnnouncementSpeakingRef.current) return false

    if (!speechRef.current?.isStarted()) {
      speechRef.current?.start()
    }

    console.log("Start listening!!")
    isListeningRef.current = true
    setIsListening(true)
  }
  const sentSpeechData = async (message: string) => {
    try {
      await axios.post(process.env.NEXT_PUBLIC_API_URL + "/api/announcements/ask_announcement", {
        text: message
      })
    } catch (error) {
      console.error("Error from sent speech data:", error)
    }

  }

  const loadSpeechTimeout = () => {
    console.log("start time out!!")
    stopSpeechTimeout.current = setTimeout(() => {
      console.log("Timeout start")
      speechRef.current?.stop()

      if (!isAnnouncementSpeakingRef.current) {
        if (speechMessageRef.current !== "") {
          isProcessingRef.current = true
          setIsProcessing(true)
          sentSpeechData(speechMessageRef.current)
        }
      }

      speechMessageRef.current = ""
      isListeningRef.current = false

      setIsListening(false)
      setSpeechMessage("")
      console.log("stop time out!!")
    }, MAX_SPEECH_TIMEOUT);
  }

  const handleFaceLeave = () => {

    if (isProcessingRef.current) return false
    if (isAnswerSpeakingRef.current) return false
    if (isAnnouncementSpeakingRef.current) return false

    if (!isListeningRef.current) {
      resetStopSpeechTimeout()
    }

  }

  const resetStopSpeechTimeout = () => {
    clearStopSpeechTimeout()
    loadSpeechTimeout()
    stopSpeechTimeout.current = null
  }

  const onTranscript = (text: string) => {
    if (isProcessingRef.current) return false
    if (isAnswerSpeakingRef.current) return false
    if (isAnnouncementSpeakingRef.current) return false

    speechMessageRef.current = text

    setSpeechMessage(speechMessageRef.current)
    console.log("Current message:", speechMessageRef.current)
    resetStopSpeechTimeout()

  }

  const onSpeechRecognizerAdded = (speechObject: SpeechRecognizer) => {
    speechRef.current = speechObject
  }

  const onSpeechSuccess = (speechType) => {
    console.log("Speech success!!:", speechType)
    switch (speechType) {
      case "announcement":
        isAnnouncementSpeakingRef.current = false
        break
      case "answer":
        isAnswerSpeakingRef.current = false

        break
    }
  }

  const onSpeechMessageAdded = (messageType) => {
    switch (messageType) {
      case "announcement":
        isAnnouncementSpeakingRef.current = true
        break
      case "answer":
        isAnswerSpeakingRef.current = true
        isProcessingRef.current = false
        setIsProcessing(false)
        break
    }
  }

  const canSpeechPassCheck = (speechType: string) => {
    switch (speechType) {
      case "announcement":
        return true
      case "answer":
        if (isAnnouncementSpeakingRef.current) {
          isProcessingRef.current = false
          setIsProcessing(false)
          return false
        }
        return true
    }

    return true
  }

  useEffect(() => {

    const socket = loadSocket()

    return () => {
      socket.off("new-message")
      socket.off("new-speech")
    }
  }, [])


  return (
    <>
      <SpeechToTextComponent
        onTranscript={onTranscript}
        onSpeechRecognizerAdded={onSpeechRecognizerAdded}
      />
      <SpeechComponent
        onSpeechSuccess={onSpeechSuccess}
        onMessageAdded={onSpeechMessageAdded}
        canSpeechPassCheck={canSpeechPassCheck}
      />
      <FaceDetectorComponent
        onFaceEnter={handleFaceEnter}
        onFaceLeave={handleFaceLeave}
      />
      {isListening &&
        <ListeningComponent text={speechMessage} />

      }

      {isProcessing &&
        <ProcessingComponent />

      }

      <div className="fixed z-3 bg-white">
        <button onClick={() => {
          isAnnouncementSpeakingRef.current = !isAnnouncementSpeakingRef.current
          setIsAnnouncing(isAnnouncementSpeakingRef.current)
        }}>Test Announcement {isAnnounceing ? "true" : "false"}</button>
      </div>
      <div className="">
        {showStartButton &&
          <button onClick={() => setShowStartButton(false)} className="w-screen h-screen text-primary font-bold text-2xl bg-white text-center z-2 fixed cursor-pointer">กดเพื่อเริ่มต้นการใช้งาน</button>
        }
        <ImagePage imagesList={imagesList} />

      </div>
    </>

  )
}
export default AnnouncementPage