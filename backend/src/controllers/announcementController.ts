import type { Request, Response } from "express";

import { generateText } from "../services/aiService";
import { sentSpeechMessageToClient, SpeechConfig } from "./ttsController";
import { AnnouncementData, startAnnouncement } from "../services/announcementService";

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

    await generateText(data.text, (renderedMessage: string) => {
        console.log("Rendered message:", renderedMessage)
        sentSpeechMessageToClient(speechContextList.answerSpeech, renderedMessage)
    })
    response.status(200).json({ success: true })
}