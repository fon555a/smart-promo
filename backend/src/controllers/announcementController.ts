import type { Request, Response } from "express";

import { generateText } from "../services/aiService";
import { sentSpeechMessageToClient, SpeechConfig } from "./ttsController";
import { AnnouncementData, startAnnouncement } from "../services/announcementService";
import { getAllTodayAnnouncements } from "../services/announcementDatabaseService";

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

    startAnnouncement(announcementData)

    response.status(200).json({ success: true })
}

export const askAnnouncement = async (request: Request, response: Response) => {
    const data: AskAnnouncementData = request.body

    const allTodayAnnouncements = await getAllTodayAnnouncements()

    const maskedData = allTodayAnnouncements.map((data) => {
        return data.text
    })

    console.log("MaskedData:", maskedData)
    const jsonData = JSON.stringify({
        "วันนี้": maskedData
    })
    const prompt = data.text + "ข้อมูล: " + jsonData

    console.log("Prompt:", prompt)
    await generateText(prompt, (renderedMessage: string) => {
        console.log("Rendered message:", renderedMessage)
        sentSpeechMessageToClient(speechContextList.answerSpeech, renderedMessage)
    })
    response.status(200).json({ success: true })
}