import type { Request, Response } from "express";

import { generateSteamingText, generateText } from "../services/aiService";
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

    const text: string = announcementData.text

    const isAnnouncement = await isAnnouncementText("ประกาศ " + text)

    if (!isAnnouncement) {
        console.error("This is not an announcement text")
        response.status(200).json({ success: false, error: "this is not announcement text", isNotAnnouncement: true })

        return false
    }

    const maskedAnnouncementData = await startAnnouncement(announcementData)

    if (!maskedAnnouncementData) {
        response.status(500).json({ success: false, error: "database error" })
        return false
    }

    console.log("Masked announcement:", maskedAnnouncementData)
    response.status(200).json({ success: true, data: maskedAnnouncementData })
    return true
}

export const getStartedAnnouncement = async (request: Request, response: Response) => {
    const allAnnouncement = await getStartedAnnouncementsData()
    response.status(200).json(allAnnouncement)
}

export const isAnnouncementText = async (text: string) => {
    const generatedText: string = await generateText({
        prompt: text,
        systemPrompt: `You are a strict content filter. Your job is to determine if a user-submitted message is a **public announcement** without any offensive language. 

Definitions:
- A **public announcement** is any message that contains official, informative content meant for public awareness or notification. It typically includes words like "announcement," "notice," "inform," "important," or similar formal phrases.
- Offensive language includes any profanity, insults, or vulgar words.

Instructions:
- If the message is a public announcement AND contains no offensive language, respond with only: true
- Otherwise, respond with only: false
- Do NOT provide any explanations, context, or additional text.

Example:
Input: "Important announcement: The office will be closed tomorrow."
Output: true

Input: "Hey dude, what's up?"
Output: false`
    })

    console.log("Generate text:", generatedText)

    if (!generatedText) {
        console.error("Cannot get generate text")
        return false
    }

    const isAnnouncement = generatedText.includes("true")

    if (isAnnouncement) return true
    return false
}

const buildAnnouncementsTimes = (allAnnouncementData: AnnouncementDatabaseData[]): { [k: string]: AnnouncementDatabaseData[] } => {
    const timesTable: { [k: string]: AnnouncementDatabaseData[] } = {
        "วันนี้": [],
        "เมื่อวาน": [],
        "พรุ่งนี้": [],
        "หลังจากพรุ่งนี้": [],
        "ก่อนเมื่อวาน": []
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
    const prompt = "ข้อมูลประชาสัมพันธ์ทั้งหมด: " + jsonData + " " + data.text

    console.log("Prompt:", prompt)
    await generateSteamingText(prompt, (renderedMessage: string) => {
        console.log("Rendered message:", renderedMessage)
        sentSpeechMessageToClient(speechContextList.answerSpeech, renderedMessage)
    })
    response.status(200).json({ success: true })
}