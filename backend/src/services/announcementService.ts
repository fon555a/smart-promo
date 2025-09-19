
import AnnouncementOrder from "../models/AnnouncementOrder"
import AnnouncementImage from "../models/AnnouncementImage"
import dayjs from "dayjs"
 
type Data = {
    text: string,
    imageFiles: Express.Multer.File[],
    settings: {
        timeSetting: {
            startTime: string,
            endTime: string
        }
    }
}

const uploadImage = async (orderId: string, imageFile: Express.Multer.File) => {
    const databasePath = "/uploads/" + imageFile.filename
    const newImageData = await AnnouncementImage.create({
        image_path: databasePath,
        order_id: orderId
    })

    return newImageData
}

export const createAnnouncement = async (data: Data) => {
    const imageFiles = data.imageFiles
    const settings = data.settings
    const timeSetting = settings.timeSetting

    const newOrder = await AnnouncementOrder.create({
        messages: data.text,
        start_time: dayjs(timeSetting.startTime).format('YYYY-MM-DD HH:mm:ss'),
        end_time: dayjs(timeSetting.endTime).format('YYYY-MM-DD HH:mm:ss')
    })

    const imagesList = []
    for (const file of imageFiles) {
        const imageData = await uploadImage(newOrder.id, file)
        imagesList.push(imageData)
    }
    
    return [newOrder, imagesList]
}

