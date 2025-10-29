import type { Request, Response } from "express";

import { generateText } from "../services/aiService";
import { sentSpeechMessageToClient, SpeechConfig } from "./ttsController";
import { AnnouncementData, startAnnouncement } from "../services/announcementService";
import { AnnouncementDatabaseData, getAllAnnouncements, getAllTodayAnnouncements, getStartedAnnouncementsData } from "../services/announcementDatabaseService";
import dayjs from "dayjs";

type AskAnnouncementData = {
    text: string
}

const speechContextList = {
    answerSpeech: "answerSpeech"
}

export const addAnnouncement = async (request: Request, response: Response) => {
    const imageFiles = request.files
    const announcementData: AnnouncementData = JSON.parse(request.body.data)
    announcementData.imageFiles = imageFiles as any

    const isSuccess = await startAnnouncement(announcementData)

    if (!isSuccess) {
        response.status(500).json({ success: false, error: "database error" })
        return false
    }
    response.status(200).json({ success: true })
    return true
}

export const getStartedAnnouncement = async (request: Request, response: Response) => {
    const allAnnouncement = await getStartedAnnouncementsData()
    response.status(200).json(allAnnouncement)
}

const buildAnnouncementsTimes = (allAnnouncementData: AnnouncementDatabaseData[]): { [k: string]: AnnouncementDatabaseData[] } => {
    const timesTable: { [k: string]: AnnouncementDatabaseData[] } = {
    }

    const nowTime = dayjs().startOf("day")
    const yesterday = dayjs().subtract(1, 'day').startOf('day')
    const tomorrow = dayjs().add(1, "day").startOf("day")

    allAnnouncementData.forEach((data) => {
        const currentTime = dayjs(data.startTime)

        if (currentTime.isSame(nowTime, "day")) {
            timesTable["วันนี้"] ??= []
            timesTable["วันนี้"].push(data)
        } else if (currentTime.isSame(yesterday, "day")) {
            timesTable["เมื่อวาน"] ??= []
            timesTable["เมื่อวาน"].push(data)
        } else if (currentTime.isSame(tomorrow, "day")) {
            timesTable["พรุ่งนี้"] ??= []
            timesTable["พรุ่งนี้"].push(data)
        } else if (currentTime.isAfter(tomorrow, "day")) {
            timesTable["หลังจากพรุ่งนี้"] ??= []
            timesTable["หลังจากพรุ่งนี้"].push(data)
        } else if (currentTime.isBefore(yesterday, "day")) {
            timesTable["ก่อนเมื่อวาน"] ??= []
            timesTable["ก่อนเมื่อวาน"].push(data)
        }
    })

    return timesTable
}

export const askAnnouncement = async (request: Request, response: Response) => {
    const data: AskAnnouncementData = request.body

    const allAnnouncements = await getAllAnnouncements()

    const allAnnouncementWithTimes = buildAnnouncementsTimes(allAnnouncements)


    const maskedData: {[k: string]: string[]} = {}

    for (const [index, dataList] of Object.entries(allAnnouncementWithTimes)) {
        maskedData[index] = dataList.map((data) => {
            return data.text
        })
    }

    console.log("MaskedData:", maskedData)
    const jsonData = JSON.stringify(maskedData)
    const prompt = data.text + " ข้อมูลข่าวประชาสัมพันธ์ที่ผู้ใช้ได้ประกาศทั้งหมด: " + jsonData

    console.log("Prompt:", prompt)
    await generateText(prompt, (renderedMessage: string) => {
        console.log("Rendered message:", renderedMessage)
        sentSpeechMessageToClient(speechContextList.answerSpeech, renderedMessage)
    })
    response.status(200).json({ success: true })
}

// export const askAnnouncement = async (request: Request, response: Response) => {
//     const data: AskAnnouncementData = request.body

//     const allTodayAnnouncements = await getAllTodayAnnouncements()

//     const maskedData = allTodayAnnouncements.map((data) => {
//         return data.text
//     })

//     console.log("MaskedData:", maskedData)
//     const jsonData = JSON.stringify({
//         "วันนี้": maskedData
//     })
//     const prompt = data.text + " ข้อมูล: " + jsonData

//     console.log("Prompt:", prompt)
//     await generateText(prompt, (renderedMessage: string) => {
//         console.log("Rendered message:", renderedMessage)
//         sentSpeechMessageToClient(speechContextList.answerSpeech, renderedMessage)
//     })
//     response.status(200).json({ success: true })
// }