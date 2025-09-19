import "dotenv/config"
import { Request, Response } from "express"

export const getToken = async (req: Request, res: Response) => {
    const apiKey: string = process.env.ASSEMBLYAI_API_KEY as string

    try {
        const response = await fetch("https://streaming.assemblyai.com/v3/token?expires_in_seconds=60", {
            method: "GET",
            headers: {
                Authorization: apiKey
            }
        })

        if (!response.ok) {
            const text = await response.text();
            return res.status(response.status).json({ error: text });
        }

        const data = await response.json()
        console.log("Tokendata:", data)
        return res.status(200).json({ token: data.token })

    } catch (error) {
        console.error("Error fetching AssemblyAI token:", error);
        return res.status(500).json({ error: "Server error" });
    }

}