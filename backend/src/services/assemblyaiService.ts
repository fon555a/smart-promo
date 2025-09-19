import { AssemblyAI } from "assemblyai";
import type { Socket } from "socket.io";

import "dotenv/config"

const apiKey: string = process.env.ASSEMBLYAI_API_KEY as any
const client = new AssemblyAI({
  apiKey: apiKey, // อยู่ server เท่านั้น,
  
});

const CONNECTION_PARAMS = {
  sampleRate: 16000,
  formatTurns: true,
};

export const addSteamingConnection = async (socket: Socket, onComplete?: (text: string) => void) => {
  const transcriber = client.streaming.transcriber(CONNECTION_PARAMS);

  let fullTranscript = ""
  let silenceTimer: NodeJS.Timeout | null = null;

  transcriber.on("turn", (turn) => {
    console.log("Turn:", turn)
    if (turn.transcript) {
      // ส่ง transcript กลับไป client

      fullTranscript += (fullTranscript ? " " : "") + turn.transcript;
      socket.emit("transcript", turn.transcript);
      console.log("transcript:", turn.transcript)
      if (silenceTimer) clearTimeout(silenceTimer)

      silenceTimer = setTimeout(() => {
        console.log("Full text:", fullTranscript)

        if (onComplete) onComplete(fullTranscript)
        
        fullTranscript = ""
      }, 30000);
    }
  });

  transcriber.on("error", (err) => console.error(err));

  await transcriber.connect();

  socket.on("audio-chunk", async (chunk: ArrayBuffer) => {
    // รับ audio chunk จาก client แล้วส่งไป AssemblyAI
    await transcriber.sendAudio(chunk);
  });

  socket.on("disconnect", async () => {
    console.log("Client disconnected:", socket.id);
    await transcriber.close();
  });
}