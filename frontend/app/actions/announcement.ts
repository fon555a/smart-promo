'use server'

import fs from "fs/promises"

import path from "path"
import getGetConnection from "../../lib/database"


interface Params {
    messages: string,
    imageFiles: File[],

    settings: {
        timeSetting: {
            startDateAndTime: string | undefined,
            endDateAndTime: string | undefined
        }
    }
}

interface ScheduleMessage {
    id: string,
    images: string[],
    text: string,
    startTime: string | undefined,
    endTime: string | undefined
}

const uploadImageFile = async (order_id: number, imageFile: File) => {

    const bytes = await imageFile.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const ext = path.extname(imageFile.name)
    const uniqueName = crypto.randomUUID() + ext

    const uploadDir = path.join(process.cwd(), "public/uploads")
    const filePath = path.join(uploadDir, uniqueName)

    await fs.writeFile(filePath, buffer)

    const databasePath = "/uploads/" + uniqueName

    const connection = await getGetConnection()
    const statement = connection.prepare("INSERT INTO announcement_images(order_id, image_path) VALUES(?, ?)")
        ; (await statement).execute([order_id, databasePath])
    return databasePath
}

const scheduleMessage = async (message: ScheduleMessage) => {
   

    const response = await fetch("http://localhost:3000/api/send-message", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(message)
    })
}

export async function addAnnouncement(params: Params) {
    const timeSetting = params.settings.timeSetting
    const imageFiles = params.imageFiles

    const connection = await getGetConnection()
    const statement = await connection.prepare("INSERT INTO announcement_order(messages, start_time, end_time) VALUES(?, ?, ?)")

    const [result] = await statement.execute([params.messages, timeSetting.startDateAndTime, timeSetting.endDateAndTime])

    const insertId = (result as any).insertId

    const uploadPaths = await Promise.all(imageFiles.map((file: File) => uploadImageFile(insertId, file)))

    scheduleMessage({
        id: insertId,
        images: uploadPaths,
        text: params.messages,
        startTime: timeSetting.startDateAndTime,
        endTime: timeSetting.endDateAndTime
    })

}