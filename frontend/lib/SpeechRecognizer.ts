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
  abort: () => void
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
  private loopStartTimeout: NodeJS.Timeout = null

  private buffer = ""; // เก็บข้อความทั้งหมดตั้งแต่เริ่มฟัง

  constructor() {
    if (typeof window !== "undefined") {

      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        console.warn("This browser does not support SpeechRecognition");
        return;
      }

      this.recognition = new SpeechRecognition();
      this.recognition.lang = "th-TH";
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;

      this.recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptChunk = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            this.buffer += transcriptChunk + " ";
          } else {
            interimTranscript += transcriptChunk + " ";
          }
        }

        // รวมทุกข้อความ (interim + final buffer)
        this.callback?.((this.buffer + interimTranscript).trim(), false);

        // ✅ รันทันทีที่ข้อความ interim update
        this.interimCallback?.(interimTranscript.trim());
      };

      this.recognition.onerror = (event) => {
        console.error("SpeechRecognition error:", event.error);
      };

      this.recognition.onend = () => {
        if (this.isListening) {
          this.recognition?.abort()
          setTimeout(() => {
            this.recognition?.start()
          }, 500);
        } // auto restart
      };
    }
  }

  public isStarted() {
    return this.isListening;
  }

  private startLoopTimeout() {
    this.stopLoopTimeout()
    this.loopStartTimeout = setTimeout(() => {
      this.start()
    }, 5000)
  }

  private stopLoopTimeout() {
    if (this.loopStartTimeout) {
      clearTimeout(this.loopStartTimeout)
      this.loopStartTimeout = null
    }
  }

  public start() {
    if (!this.recognition) return;
    // if (!this.loopStartTimeout) {
    //   this.startLoopTimeout()
    // }
    this.isListening = true;


    try {
      this.recognition.start();
    } catch (error) {
      console.error("Speech error:", error)
    }
  }

  public stop() {
    if (!this.recognition) return;
    this.isListening = false;
    this.recognition.stop();
    // this.stopLoopTimeout()

    // ส่ง callback สุดท้ายเป็น final
    if (this.buffer) {
      this.callback?.(this.buffer.trim(), true);
      this.buffer = "";
    }
  }

  // callback แบบรวมข้อความทั้งหมด
  public onTranscript(callback: TranscriptCallback) {
    this.callback = callback;
  }

  // callback แบบทีละคำ/ก้อนชั่วคราว
  public onInterim(callback: InterimCallback) {
    this.interimCallback = callback;
  }
}