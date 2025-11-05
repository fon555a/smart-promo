// lib/SpeechRecognizer.ts
export type TranscriptCallback = (text: string, isFinal: boolean) => void;
export type InterimCallback = (text: string) => void;



type SpeechRecognitionEvent = {
  resultIndex: number,
  results: {
    length: number
  }
}

type SpeechRecognition = {
  lang: string,
  continuous: boolean,
  interimResults: boolean,
  maxAlternatives: number,
  onresult: (event: SpeechRecognitionEvent) => void,
  onerror: (event: ErrorEvent) => void,
  onend: () => void,
  start: () => void,
  stop: () => void,
  abort: () => void,
  addEventListener: (key: string, handler: () => void) => void
}

type Windows = {
  SpeechRecognition: SpeechRecognition,
  webkitSpeechRecognition: SpeechRecognition
}

export class SpeechRecognizer {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;
  private callback: TranscriptCallback | null = null;
  private interimCallback: InterimCallback | null = null;
  private buffer = "";

  private currentInstances: SpeechRecognition[] = []

  private inactivityTimer: NodeJS.Timeout | null = null;

  private resetInactivityTimer() {
    if (this.inactivityTimer) clearTimeout(this.inactivityTimer);
    this.inactivityTimer = setTimeout(async () => {
      console.log("No speech detected for 10 seconds, stopping...");
      await this.stop(); // หยุด loop ถ้าไม่มีเสียงเลย 10 วิ
    }, 10000);
  }

  private async stopAllInstances() {
    const promises = this.currentInstances
      .filter(i => i !== this.recognition)
      .map(instance => new Promise<void>(resolve => {
        try {
          const handle = () => {
            instance.onend = null
            resolve()
          }
          instance.onend = handle
          instance.stop()
        } catch {
          resolve()
        }

      }))
    await Promise.allSettled(promises)
    this.currentInstances = this.recognition ? [this.recognition] : []
  }


  public async start(force=false) {
    console.log("Is Listening:", this.isListening)
    if (this.isListening && !force) {
      return false
    }
    console.log("Really started.")
    await this.clearSpeech()
    this.isListening = true;

    const RecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!RecognitionClass) {
      console.warn("SpeechRecognition not supported");
      return;
    }

    // สร้างใหม่ทุกครั้ง
    this.recognition = new RecognitionClass();
    this.recognition.lang = "th-TH";
    this.recognition.continuous = true; // ❗ปิด continuous
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 1;

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      // this.resetInactivityTimer()

      const result = event.results[event.resultIndex];
      const transcript = result[0].transcript;
      if (result.isFinal) {
        this.buffer += transcript + " ";
        this.callback?.(this.buffer.trim(), true);

      } else {
        this.interimCallback?.(transcript.trim());
      }
    };

    this.recognition.onerror = async (event) => {
      if (this.isListening) {
        await this.start(true)
      }
      console.error("Speech error:", event.error);
    };

    this.recognition.onend = async () => {
      console.log("Speech is ending")

      if (this.isListening) {
        console.log("Start from on end")
        await this.start(true)
      }
    }

    // this.recognition.onend = async () => {
    //   console.log("End!!")
    //   if (this.isListening) await this.restart(); // จบ session -> restart ใหม่
    // };

    this.currentInstances.push(this.recognition)
    this.recognition.start();
  }

  // private async restart() {
  //   await this.stop()
  //   if (this.isListening) {
  //     console.log("Start!!")
  //     await this.start()
  //   }

  // }

  private async clearSpeech() {
    console.log("StopHell nahh!!")
    this.recognition?.stop()
    this.recognition = null;

    await this.stopAllInstances()
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
    this.buffer = ""
  }

  public async stop() {

    this.isListening = false
    this.clearSpeech()

  }

  public isStarted() {
    return this.isListening;
  }

  public onTranscript(callback: TranscriptCallback) {
    this.callback = callback;
  }

  public onInterim(callback: InterimCallback) {
    this.interimCallback = callback;
  }
}
