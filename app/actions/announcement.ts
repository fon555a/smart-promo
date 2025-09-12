'use server'

import fs from "fs/promises"
import getGetConnection from "@/lib/database"
import path from "path"


interface Params  {
    messages: string,
    imageFiles: File[],

    settings: {
        timeSetting: {
            startDateAndTime: string | undefined,
            endDateAndTime: string | undefined
        }
    }
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
    ;(await statement).execute([order_id, databasePath])
}

export async function addAnnouncement(params: Params) {
    const timeSetting = params.settings.timeSetting
    const imageFiles = params.imageFiles

    const connection = await getGetConnection()
    const statement = await connection.prepare("INSERT INTO announcement_order(messages, start_time, end_time) VALUES(?, ?, ?)")
    
    const [result] = await statement.execute([params.messages, timeSetting.startDateAndTime, timeSetting.endDateAndTime])

    const insertId = (result as any).insertId
    
    imageFiles.forEach((file: File) => {
        uploadImageFile(insertId, file)
    })
}