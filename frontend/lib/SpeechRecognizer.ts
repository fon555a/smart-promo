import { getSocket } from "./socket"

export class SpeechRecognizer {
  private socket = null
  private started = false
  private fullTranscript  = ""


  private callBackList = {
    onTranscript: []
  }
  constructor() {
    this.socket = getSocket("asr")

    this.socket.on("message", (message) => {
      console.log("Message:", message)
      
      const text = this.fullTranscript + message.transcript + " "
      
      if (message["is_final"]) {
        this.fullTranscript = text
      }
      
      for (const callBack of this.callBackList.onTranscript) {
        console.log("Call back:", callBack)
        callBack(text.trim())
      }
    })
  }

  public isStarted() {
    return this.started
  }


  public start() {
    this.socket.emit("start")
    this.started = true
    this.fullTranscript = ""
  }

  public stop() {
    this.socket.emit("stop")
    this.started = false
    this.fullTranscript = ""
  }

  // callback แบบรวมข้อความทั้งหมด
  public onTranscript(callback) {
    this.callBackList.onTranscript.push(callback)
    const index = this.callBackList.onTranscript.length

    return {
      disconnect: this.callBackList.onTranscript.splice(1, index)
    }
  }
}
