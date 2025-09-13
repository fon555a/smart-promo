'use client'
import { useEffect } from "react"
import ImagePage from "./components/ImagePage"
import { getSocket } from "@/lib/socket"

const AnnouncementPage = () => {

  useEffect(() => {
    const socket = getSocket()

    socket.on("new-message", (message) => {
      console.log("new message:", message)
    })

    return () => {
      socket.off("new-message")
    }
  }, [])

  return (
    <div className="">
        <ImagePage image_path={"/uploads/0da6441d-be88-410b-9c54-edc32b533eac.jpg"}/>
    </div>
  )
}
export default AnnouncementPage