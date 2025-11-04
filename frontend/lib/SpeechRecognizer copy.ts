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
  private buffer = "";

  public start() {
    // if (this.isListening) return;
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
      console.log("Event:", event)
      const result = event.results[event.resultIndex];
      const transcript = result[0].transcript;
      if (result.isFinal) {
        this.buffer += transcript + " ";
        this.callback?.(this.buffer.trim(), true);

      } else {
        console.log("Interim:", transcript.trim())
        this.interimCallback?.(transcript.trim());
      }
    };

    this.recognition.onerror = (event) => {
      console.error("Speech error:", event.error);
      this.restart(); // ถ้ามี error ก็ restart ใหม่
    };

    this.recognition.onend = () => {
      if (this.isListening) this.restart(); // จบ session -> restart ใหม่
    };

    this.recognition.start();
  }

  private restart() {
    this.recognition?.stop();
    this.recognition = null;
    setTimeout(() => {
      if (this.isListening) {
        console.log("Start!!")
        this.start()
      }
    }, 200);

  }

  public stop() {
    this.isListening = false;
    this.recognition?.stop();
    this.recognition = null;
    console.log("Stop!!")
    this.buffer = ""
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
