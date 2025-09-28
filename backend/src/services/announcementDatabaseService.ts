
import AnnouncementOrderModel from "../models/AnnouncementOrder"
import AnnouncementImageModel from "../models/AnnouncementImage"

import dayjs from "dayjs"
import { literal, Op } from "sequelize"
import { MAX_ANNOUNCEMENT_TIMEOUT } from "../constants"
import sequelize from "../database"

const AnnouncementOrder = AnnouncementOrderModel(sequelize)
const AnnouncementImage = AnnouncementImageModel(sequelize, AnnouncementOrder)

type Data = {
    text: string,
    imageFiles: Express.Multer.File[],
    settings: {
        timeSetting: {
            startTime: string,
        }
    }
}

type OrderData = {
    id: number,
    start_time: string,
    messages: string
}

type ImageData = {
    image_path: string,
    order_id: number
}

export type AnnouncementDatabaseData = {
    id: number,
    startTime: string,
    text: string,
    images: string[]
}

const uploadImage = async (orderId: number, imageFile: Express.Multer.File) => {
    const databasePath = "/uploads/" + imageFile.filename
    const newImageData = await AnnouncementImage.create({
        image_path: databasePath,
        order_id: orderId
    })

    return newImageData
}

const buildData = (orderData: OrderData, imagesData: ImageData[]): AnnouncementDatabaseData => {
    const imagesPath = imagesData.map((image) => image.image_path)

    const data: AnnouncementDatabaseData = {
        id: orderData.id,
        startTime: orderData.start_time,
        text: orderData.messages,
        images: imagesPath
    }

    return data
}

const buildDataFromOrderResults = async (orderResults: OrderData[]): Promise<AnnouncementDatabaseData[]> => {
    const allAnnouncement: AnnouncementDatabaseData[] = []

    for (const orderData of orderResults) {
        const imagesData: ImageData[] = await AnnouncementImage.findAll({
            where: {
                order_id: orderData.id
            }
        }) as any

        const buildedData = buildData(orderData, imagesData)
        allAnnouncement.push(buildedData)
    }

    return allAnnouncement
}

export const getAllTodayAnnouncements = async () => {

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);


    const results: OrderData[] = await AnnouncementOrder.findAll({
        where: {
            createdAt: {
                [Op.gte]: startOfToday,
                [Op.lte]: endOfToday,
            }
        }
    }) as any;

    const allAnnouncement: AnnouncementDatabaseData[] = await buildDataFromOrderResults(results)
    return allAnnouncement
}

export const getAllCurrentAnnouncement = async (): Promise<AnnouncementDatabaseData[]> => {
    const allOrderData: OrderData[] = await AnnouncementOrder.findAll({
        where: {

            [Op.or]: [
                // 1️⃣ start_time ยังไม่ถึง
                {
                    start_time: { [Op.gt]: new Date() }
                },
                // 2️⃣ ตอนนี้อยู่ระหว่าง start_time → start_time + 20s
                literal(`NOW() BETWEEN start_time AND DATE_ADD(start_time, INTERVAL ${MAX_ANNOUNCEMENT_TIMEOUT} SECOND)`)
            ]

        },
        order: [
            ['start_time', 'ASC'] // เรียงจากน้อย → มาก (เวลาใกล้ที่สุดมาก่อน)
        ]
    }) as any

    const allAnnouncement: AnnouncementDatabaseData[] = await buildDataFromOrderResults(allOrderData)

    return allAnnouncement
}

export const addAnnouncementData = async (data: Data): Promise<[OrderData, ImageData[]]> => {
    const imageFiles = data.imageFiles
    const settings = data.settings
    const timeSetting = settings.timeSetting

    const newOrder: OrderData = await AnnouncementOrder.create({
        messages: data.text,
        start_time: dayjs(timeSetting.startTime).format('YYYY-MM-DD HH:mm:ss'),
    }) as any

    const imagesList = []
    for (const file of imageFiles) {
        const imageData: ImageData = await uploadImage(newOrder.id, file) as any
        imagesList.push(imageData)
    }


    return [newOrder, imagesList]
}

