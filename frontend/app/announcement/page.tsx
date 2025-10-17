'use client'
import { useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import ImagePage from "./components/ImagePage"
import { getSocket } from "../../lib/socket"

import dynamic from "next/dynamic";
import ListeningComponent from "./components/ListeningComponent"

import { SpeechRecognizer } from "../../lib/SpeechRecognizer"
import SpeechComponent from "./components/SpeechComponent"
import SpeechToTextComponent from "./components/SpeechToTextComponent"
import ProcessingComponent from "./components/ProcessingComponent"

import { useMachine } from "@xstate/react"
import { speechMachine } from "./machines/speechMachine"

import QRCodeComponent from "./components/QRCodeComponent";

const FaceDetectorComponent = dynamic(
  () => import("./components/FaceDetectorComponent"),
  { ssr: false }
);

type MessageData = {
  id: number,
  imagesList: Array<string>,
  text: string
}

const MAX_SPEECH_TIMEOUT = 1500

const socketList = {
  "add-announcement": "add-announcement",
  "remove-current-announcement": "remove-current-announcement",
  "distance-update": "distance-update",
  "load-server-ip": "load-server-ip",
  "socket-connected": "socket-connected"
}

const AnnouncementPage = () => {

  const [showStartButton, setShowStartButton] = useState(true)
  const [imagesList, setImagesList] = useState<string[]>([])
  const [qrcodeLink, setQrcodeLink] = useState<string>(null)

  const searchParams = useSearchParams()
  const isKiosk = searchParams.get("kiosk")
  const speechRef = useRef<SpeechRecognizer | null>(null)
  const stopSpeechTimeout = useRef<NodeJS.Timeout | null>(null)

  const [state, send] = useMachine(speechMachine)
  const stateRef = useRef(state)


  useEffect(() => {
    console.log("Is kiosk:", typeof(isKiosk), isKiosk)

    stateRef.current = state
    console.log("state:", stateRef.current.value)
  }, [state])

  const isStateMatch = (state: string) => {
    if (stateRef.current.value === state) {
      return true
    }
    return false
  }

  const getContext = (context: string) => {
    return stateRef.current.context[context]
  }

  const loadQrCode = () => {
    const url = process.env.NEXT_PUBLIC_DOMAIN_URL
    setQrcodeLink(url)
    send({ type: "SET_SERVERURL", url: url })
    console.log("Url:", url)
  }

  const loadSocket = () => {
    const socket = getSocket()

    loadQrCode()

    socket.on(socketList["socket-connected"], () => {
      console.log("Socket is connected!!!")
    })

    socket.on(socketList["add-announcement"], async (messageData: MessageData) => {
      console.log("new message:", messageData)
      const newImageList = messageData.imagesList.map((image) => {
        return process.env.NEXT_PUBLIC_DOMAIN_URL + "/api/announcements" + image
      })
      console.log("New image list:", newImageList)
      setImagesList(newImageList)
      send({ type: "ANNOUNCEMENT" })

    })

    socket.on(socketList["remove-current-announcement"], () => {
      setImagesList([])
      send({ type: "ANNOUNCEMENT_SPEAK_SUCCESS" })
    })

    socket.on(socketList["distance-update"], (distance: string) => {
      console.log("Distance update:", distance)
    })



    return socket
  }

  const clearStopSpeechTimeout = () => {
    if (stopSpeechTimeout.current) {
      clearTimeout(stopSpeechTimeout.current)
      stopSpeechTimeout.current = null

    }
  }

  const handleFaceEnter = () => {

    send({ type: "FACE_ENTER" })

    if (isStateMatch("listening")) {
      if (!speechRef.current?.isStarted()) {
        speechRef.current?.start()
      }

      clearStopSpeechTimeout()
      console.log("Face enter")
    }
  }

  const loadSpeechTimeout = () => {
    console.log("Load timeout")
    stopSpeechTimeout.current = setTimeout(() => {

      if (isStateMatch("listening")) {
        send({ type: "TIMEOUT" })
        console.log("ListeningTimeout")
      } else if (isStateMatch("userTalking")) {
        send({ type: "SEND_SPEAK_DATA" })
        console.log("Send speak data.")
      }
      speechRef.current?.stop()

      send({ type: "RESET_MESSAGE" })
      console.log("Timeout Started")
    }, MAX_SPEECH_TIMEOUT);
  }

  const handleFaceLeave = () => {
    if (!isStateMatch("listening")) {
      return false
    }
    resetStopSpeechTimeout()
  }

  const resetStopSpeechTimeout = () => {
    clearStopSpeechTimeout()
    loadSpeechTimeout()
  }

  const onTranscript = (text: string) => {
    send({ type: "START_TALKING" })
    if (!isStateMatch("userTalking")) return false

    send({ type: "SET_MESSAGE", text: text })
    console.log("Current message:", text)
    resetStopSpeechTimeout()
  }

  const onSpeechRecognizerAdded = (speechObject: SpeechRecognizer) => {
    speechRef.current = speechObject
  }

  const onSpeechSuccess = (speechType) => {
    console.log("Speech success!!:", speechType)
    switch (speechType) {
      case "answer":
        send({ type: "ANSWER_SPEAK_SUCCESS" })
        break
    }
  }

  const onSpeechMessageAdded = (messageType) => {
    switch (messageType) {
      case "announcement":
        break
      case "answer":
        send({ type: "PROCESSING_SUCCESS" })
        break
    }
  }

  const canSpeechPassCheck = (speechType: string) => {
    switch (speechType) {
      case "announcement":
        return true
      case "answer":
        if (isStateMatch("announcementSpeaking")) {
          return false
        }
        return true
    }

    return true
  }

  useEffect(() => {

    const socket = loadSocket()

    return () => {
      Object.values(socketList).forEach((socketId) => socket.off(socketId))


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
      {(state.matches("listening") || state.matches("userTalking")) &&
        <ListeningComponent text={state.context.message} />
      }

      {(state.matches("processing") || state.matches("sending")) &&
        <ProcessingComponent />
      }
      <h1 className="fixed z-3 bg-white">State: {state.value as string}</h1>

      {/* <div className="fixed z-3 bg-white">
        <button onClick={() => {
          isAnnouncementSpeakingRef.current = !isAnnouncementSpeakingRef.current
          setIsAnnouncing(isAnnouncementSpeakingRef.current)
        }}>Test Announcement {isAnnounceing ? "true" : "false"}</button>
      </div> */}
      <div className="">
        {!isKiosk && showStartButton &&
          <button onClick={() => setShowStartButton(false)} className="w-screen h-screen text-primary font-bold text-2xl bg-white text-center z-3 fixed cursor-pointer">กดเพื่อเริ่มต้นการใช้งาน</button>
        
        }
        <ImagePage imagesList={imagesList} />

      </div>
      {(!state.matches("announcementSpeaking") && qrcodeLink) &&
        <QRCodeComponent url={qrcodeLink} />

      }
    </>

  )
}
export default AnnouncementPage