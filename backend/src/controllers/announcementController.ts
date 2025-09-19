import type { Request, Response } from "express";
import { getIo } from "../io";
import { convertTextToSpeech } from "../services/ttsService";
import { createAnnouncement } from "../services/announcementService";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"
import { Express } from "express"

dayjs.extend(utc)
dayjs.extend(timezone)
type MessageData = {
    text: string,
    imageFiles: Express.Multer.File[],
    settings: {
        timeSetting: {
            startTime: string,
            endTime: string
        }
    }
}

type UploadedImage = {
    id: number,
    image_path: string,
    order_id: string
}

type ScheduleSettings = {
    startTime: string,
    endTime: string,
    
}

type MaskedMessage = {
    id: number,
    imagesList: Array<string>,
    text: string
}

const sendMessageToClient = async (messageData: MaskedMessage) => {
    const io = getIo()

    console.log("New message!!!")
    io.emit("new-message", messageData)
}

const sendMessageSpeechToClient = async (text: string) => {
    const speechAudio = await convertTextToSpeech(text)

    if (!speechAudio) {
        console.error("Cannot get the TTS Audio.")
        return false
    }

    const io = getIo()
    io.emit("new-speech", speechAudio)
}


const startScheduleMessage = async (config: ScheduleSettings, onStart: () => void, onEnd: () => void) => {

    const now = dayjs()
    
    const startTime = dayjs.utc(config.startTime).tz("Asia/Bangkok")
    const endTime = dayjs.utc(config.endTime).tz("Asia/Bangkok")

    const startDelay = startTime.valueOf() - now.valueOf()
    const endDelay = endTime.valueOf() - now.valueOf()

    console.log("Start delay:", startDelay)
    console.log("End delay:", endDelay)

    setTimeout(async () => {
        // await sendMessageToClient(messageData)
        await onStart()
    }, Math.max(0, startDelay));

    if (endDelay > 0) {
        setTimeout(async () => {
            // removeMessage(messageData)
            await onEnd()
        }, endDelay);
    }
}

const removeMessage = (messageData: MaskedMessage) => {
    const io = getIo()
    io.emit("remove-message", messageData)
}

const maskMessageData = (messageData: MessageData, orderId: number, uploadedImages: Array<UploadedImage>): MaskedMessage => {
    const imageList = uploadedImages.map((imageData) => {
        return imageData.image_path
    })
    const maskData: MaskedMessage = {
        id: orderId,
        text: messageData.text,
        imagesList: imageList
    }

    return maskData
}
export const addAnnouncement = async (request: Request, response: Response) => {
    const imageFiles = request.files
    const messageData: MessageData  = JSON.parse(request.body.data)
    messageData.imageFiles = imageFiles as any
    
    const settings = messageData.settings
    const timeSetting = settings.timeSetting
    

    console.log("Message data:", messageData)
    const [orderData, uploadedImages] = await createAnnouncement(messageData)
    const maskedMessageData = maskMessageData(messageData, orderData.id, uploadedImages)
    await startScheduleMessage({
        startTime: timeSetting.startTime,
        endTime: timeSetting.endTime
    }, () => sendMessageToClient(maskedMessageData), () => removeMessage(maskedMessageData))
    // await sendMessageSpeechToClient(messageData.text)
    console.log("MessageData:", messageData)
    console.log("Test123")
    response.status(200).json({ success: true });
}

