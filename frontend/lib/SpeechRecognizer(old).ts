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

// Note: intentionally not creating a strict "window" typing here because
// the Web Speech API types differ across browsers (SpeechRecognition / webkitSpeechRecognition).
// We use a loose cast where necessary below.

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
        let hadFinal = false;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptChunk = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            this.buffer += transcriptChunk + " ";
            hadFinal = true;
          } else {
            interimTranscript += transcriptChunk + " ";
          }
        }

        // ส่ง interim ก่อนเสมอ (ถ้ามี)
        if (interimTranscript.trim()) {
          this.interimCallback?.(interimTranscript.trim());
        }

        // ถ้ามี final result ให้ส่งเป็น final callback และเคลียร์ buffer
        if (hadFinal) {
          const finalText = this.buffer.trim();
          if (finalText) {
            this.callback?.(finalText, true);
          }
          // เคลียร์ buffer หลังส่ง final
          this.buffer = "";
        } else {
          // ยังไม่มี final ส่งสถานะ interim/partial
          this.callback?.((this.buffer + interimTranscript).trim(), false);
        }
      };

      this.recognition.onerror = (event) => {
        try {
          console.error("SpeechRecognition error:", (event as any).error || event);
        } catch (e) {
          console.error("SpeechRecognition unknown error", e);
        }

        // สำหรับ error ที่ recoverable ให้ลอง restart ถ้าเราต้องการฟังต่อ
        const err = (event as any).error as string | undefined;
        const recoverable = ["no-speech", "network", "aborted", "audio-capture", "not-allowed", "service-not-allowed"];
        if (this.isListening && err && recoverable.includes(err)) {
          // ลองรีสตาร์ทหลังหน่วงเวลาเล็กน้อย
          setTimeout(() => {
            try {
              this.recognition?.start();
            } catch {
              // ignore start errors
            }
          }, 500);
        }
      };

      this.recognition.onend = () => {
        // บาง browser จะหยุด session หลังเวลาหนึ่ง หากเรายังต้องการฟังต่อให้พยายามเริ่มใหม่
        if (this.isListening) {
          setTimeout(() => {
            try {
              this.recognition?.start();
            } catch {
              // ถ้า start ล้มเหลว ให้รอแล้วลองอีกครั้ง
              setTimeout(() => {
                try { this.recognition?.start(); } catch { }
              }, 2000);
            }
          }, 500);
        }
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
