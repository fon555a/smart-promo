import { Socket } from "socket.io-client";

export type TranscriptionCallback = (text: string) => void;

export class Transcriber {
    private socket: Socket;
    private callback: TranscriptionCallback | null = null;
    private mediaRecorder: MediaRecorder | null = null;

    constructor(socket: Socket) {
        this.socket = socket;
    }

    onTranscription(callback: TranscriptionCallback) {
        this.callback = callback;
        // ถ้า socket already มีข้อความย้อนหลัง สามารถ handle ได้ตรงนี้
        this.socket.on("transcript", (text: string) => {
            if (this.callback) this.callback(text);
        });
    }

    async start(): Promise<void> {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

        this.mediaRecorder.addEventListener("dataavailable", (event: BlobEvent) => {
            if (event.data.size > 0 && this.socket.connected) {
                event.data.arrayBuffer().then((buffer) => {
                    this.socket.emit("audio", buffer);
                });
            }
        });

        this.mediaRecorder.start(250);
    }

    stop(): void {
        if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
            this.mediaRecorder.stop();
        }
        // ไม่ disconnect socket เพราะอาจใช้ต่อกับฟังก์ชันอื่น
    }
}
