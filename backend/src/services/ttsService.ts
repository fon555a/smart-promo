import FormData from "form-data"
import axios from "axios"
import { default as z } from "zod"
import "dotenv/config"

const convertText = z.string()

// @params text string
export const convertTextToSpeech = async (text: string): Promise<[false, string] | [ArrayBuffer]> => {
    const checkResult = convertText.safeParse(text)

    if (!checkResult.success) {
        console.error("The type of the text must be a string.")
        return [false, "The type of the text must be a string."]
    }

    const apiKey = process.env.TTS_API_KEY
    console.log("Api key:", apiKey)
    const formData = new FormData()
    formData.append("text", text)
    formData.append("language", "TH")

    try {
        const response = await axios.post(
            "https://api.iapp.co.th/thai-tts-kaitom2/tts",
            formData,
            {
                headers: {
                    apikey: apiKey,
                    ...formData.getHeaders(),
                },
                responseType: "arraybuffer", // รับเป็น binary
            }
        );
        return [response.data]

    } catch (error) {
        console.error("Speech error:", error)
        return [false, error as string]
    }




}

