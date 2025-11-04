'use client'
import { useCallback, useEffect, useRef, useState } from "react"
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
import WebCamComponent from "./components/WebCamComponent"
import GuideComponent from "./components/GuideComponent"

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

const socketList = {
  "add-announcement": "add-announcement",
  "remove-current-announcement": "remove-current-announcement",
  "distance-update": "distance-update",
  "load-server-ip": "load-server-ip",
  "socket-connected": "socket-connected",
}

const AnnouncementPage = () => {

  const [showStartButton, setShowStartButton] = useState(true)
  const [imagesList, setImagesList] = useState<string[]>([])
  const [qrcodeLink, setQrcodeLink] = useState<string>(null)
  const [messageText, setMessageText] = useState<string>("ยังไม่มีการประกาศ")

  const searchParams = useSearchParams()
  const isKiosk = searchParams.get("kiosk")
  const speechRef = useRef<SpeechRecognizer | null>(null)
  const currentTextRef = useRef<string>("")
  const stopSpeechTimeout = useRef<NodeJS.Timeout | null>(null)

  const [state, send] = useMachine(speechMachine)
  const [currentText, setText] = useState("")

  const stateRef = useRef(state)

  const onStartChanged = (state: string) => {
    if (state === "idle") {
      setMessageText("ยังไม่มีการประกาศ")
    }
  }

  useEffect(() => {

    stateRef.current = state
    console.log("state:", stateRef.current.value)
    onStartChanged(state.value as string)
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
      setMessageText(messageData.text)
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



  const loadSpeechTimeout = () => {
    stopSpeechTimeout.current = setTimeout(async () => {

      if (isStateMatch("listening")) {
        send({ type: "TIMEOUT" })
        console.log("ListeningTimeout")
      } else if (isStateMatch("userTalking")) {
        // send({ type: "CANCEL" })
        send({ type: "SEND_SPEAK_DATA" })
        console.log("Send speak data.")
      }

      currentTextRef.current = ""
      setText("")
      await speechRef.current?.stop()
      console.log("Start reset message")
      send({ type: "RESET_MESSAGE" })

      console.log("Timeout Started")
    }, MAX_SPEECH_TIMEOUT);
  }

  const handleFaceEnter = useCallback(() => {

    send({ type: "FACE_ENTER" })

    if (isStateMatch("listening") || isStateMatch("idle")) {
      if (!speechRef.current?.isStarted()) {
        console.log("Start from page!!")
        speechRef.current?.start()
      }
      resetStopSpeechTimeout()
      // console.log("Face enter")
    }
  }, [])
  const handleFaceLeave = useCallback(() => {
    if (!isStateMatch("listening")) {
      return false
    }
    resetStopSpeechTimeout()
  }, [])

  const resetStopSpeechTimeout = () => {
    clearStopSpeechTimeout()
    loadSpeechTimeout()


  }


  const onTranscript = useCallback((text: string) => {
    send({ type: "START_TALKING" })
    console.log("Text from transcript!!", text)

    if (!isStateMatch("userTalking") && !isStateMatch("listening")) {
      console.log("Player still tralking")
      return false
    }

    send({ type: "SET_MESSAGE", text: text })
    console.log("Current message:", text)
    currentTextRef.current = text
    setText(text)
    resetStopSpeechTimeout()
  }, [])

  const onInterim = useCallback((text: string) => {
    if (isStateMatch("userTalking") || isStateMatch("listening")) {
      resetStopSpeechTimeout()
      console.log("Reset timeout")
      setText((currentTextRef.current + " " + text).trim())
    }
  }, [])

  const onSpeechRecognizerAdded = useCallback((speechObject: SpeechRecognizer) => {
    speechRef.current = speechObject
  }, [])

  const onSpeechSuccess = useCallback((speechType) => {
    console.log("Speech success!!:", speechType)
    switch (speechType) {
      case "answer":
        send({ type: "ANSWER_SPEAK_SUCCESS" })
        break
    }
  }, [])

  const onSpeechMessageAdded = useCallback((messageType) => {
    switch (messageType) {
      case "announcement":
        break
      case "answer":
        send({ type: "PROCESSING_SUCCESS" })
        break
    }
  }, [])

  const canSpeechPassCheck = useCallback((speechType: string) => {
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
  }, [])

  useEffect(() => {

    const socket = loadSocket()

    return () => {
      Object.values(socketList).forEach((socketId) => socket.off(socketId))
      socket.disconnect?.()

      if (stopSpeechTimeout.current) {
        clearTimeout(stopSpeechTimeout.current)
      }
    }
  }, [])


  return (
    <>

      <SpeechToTextComponent
        onTranscript={onTranscript}
        onInterim={onInterim}
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
        <ListeningComponent text={currentText} />
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
        <ImagePage
          imagesList={imagesList}
          noImageText={messageText}
        />

      </div>
      {(!state.matches("announcementSpeaking")) &&
        <div>
          <QRCodeComponent url={qrcodeLink} />

          <WebCamComponent />
          <GuideComponent />
        </div>

      }
    </>

  )
}
export default AnnouncementPage