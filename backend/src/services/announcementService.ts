import dayjs from "dayjs"
import { addAnnouncementData, AnnouncementDatabaseData, getAllCurrentAnnouncement } from "./announcementDatabaseService"
import { getIo } from "../io"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"
import { AnnouncementQueue } from "../classes/AnnouncementQueue"
import Announcement from "../classes/Announcement"
import winston from "winston";
import { sentSpeechMessageToClient } from "../controllers/ttsController"
import { MAX_ANNOUNCEMENT_TIMEOUT } from "../constants"

const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level}]: ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: "logs/app.log" })
    ],
});

type ScheduleSettings = {
    startTime: string,

}

dayjs.extend(utc)
dayjs.extend(timezone)

export type AnnouncementData = {
    text: string,
    imageFiles: Express.Multer.File[],
    settings: {
        timeSetting: {
            startTime: string,
        }
    }
}

type MaskedAnnouncementData = {
    id: number,
    imagesList: Array<string>,
    text: string,
    startTime: string
}

// MS
// const MAX_ANNOUNCEMENT_TIMEOUT = 120 * 1000



const createQueue = (): AnnouncementQueue => {
    const handleQueueStart = (queueInstance: { [key: string]: any }) => {
        const data: MaskedAnnouncementData = queueInstance.data
        fireAnnouncement(data)
        sentSpeechMessageToClient("announcementSpeech", data.text, {
            repeatCount: 2,
            repeatDelaySeconds: 2
        })

    }
    const handleQueueEnd = (queueInstance: { [key: string]: any }) => {

        removeCurrentAnnouncement()
    }

    const newQueue = new AnnouncementQueue({
        onQueueStart: handleQueueStart,
        onQueueEnd: handleQueueEnd
    })

    return newQueue
}

const queue = createQueue()

const getMaskedData = (data: AnnouncementData, id: number, uploadedImages: { [key: string]: any }[]): MaskedAnnouncementData => {
    const imageList = uploadedImages.map((imageData) => {
        return imageData.image_path
    })

    const maskData: MaskedAnnouncementData = {
        id: id,
        text: data.text,
        imagesList: imageList,
        startTime: data.settings.timeSetting.startTime
    }

    return maskData
}

const fireAnnouncement = (data: MaskedAnnouncementData) => {
    const io = getIo()

    console.log("New Announcement:", data.text)
    // logger.debug("New announcement!!!", data.text)
    // io.emit("add-announcement", data)
}

export const removeCurrentAnnouncement = () => {
    const io = getIo()

    console.log("Remove announcement!!")
    // logger.debug("Remove announcement!!")
    // io.emit("remove-current-announcement")
}

const startSchedule = (config: ScheduleSettings, onStart: () => void) => {
    
    const now = dayjs().tz("Asia/Bangkok")
    const startTime = dayjs.utc(config.startTime).tz("Asia/Bangkok")
    const startDelay = Math.abs(startTime.diff(now))
    console.log("Config data:", config)
    console.log("Now time:", now)
    console.log("StartTime:", startTime)
    console.log("Start delay time:", startDelay)
    logger.debug("Schedule start delay time:", startDelay)

    setTimeout(async () => {
        // await sendMessageToClient(messageData)
        await onStart()
    }, startDelay);

}

const createAnnouncement = async (data: AnnouncementData): (Promise<MaskedAnnouncementData | null>) => {
    try {
        const [orderData, uploadedImages] = await addAnnouncementData(data)
        console.log("Announcement that need:", data)
        const maskedData = getMaskedData(data, orderData.id, uploadedImages)
        console.log("Masked Data on created", maskedData)
        return maskedData
    } catch (error) {

        logger.error("Cannot create announcement:", error)
        return null
    }
}

const addAnnouncement = (data: MaskedAnnouncementData) => {
    const newAnnouncement = new Announcement(data)

    const config: ScheduleSettings = {
        startTime: data.startTime
    }
    console.log("Masked announcementData:", data)
    startSchedule(config, () => {
        queue.addQueue(newAnnouncement, MAX_ANNOUNCEMENT_TIMEOUT)
    })
}

export const startAnnouncement = async (data: AnnouncementData) => {

    const newAnnouncementData = await createAnnouncement(data)

    if (!newAnnouncementData) {
        console.error("Cannot create the announcement.")
        return false
    }

    
    addAnnouncement(newAnnouncementData)
}

const handleStartTimeBefore = (data: AnnouncementDatabaseData) => {
    const maskedData = {
        id: data.id,
        imagesList: data.images,
        text: data.text,
        startTime: data.startTime
    }

    const newAnnouncement = new Announcement(maskedData)
    queue.addQueue(newAnnouncement, MAX_ANNOUNCEMENT_TIMEOUT)

}

const handleStartTimeAfter = (data: AnnouncementDatabaseData) => {
    addAnnouncement({
        id: data.id,
        imagesList: data.images,
        text: data.text,
        startTime: data.startTime
    })
}

export const syncAllCurrentAnnouncement = async () => {
    const allCurrentData = await getAllCurrentAnnouncement()

    for (const data of allCurrentData) {
        const now = dayjs()
        const startTime = dayjs(data.startTime)

        if (startTime.isAfter(now)) {
            handleStartTimeAfter(data)
        } else {
            handleStartTimeBefore(data)
        }
    }
}