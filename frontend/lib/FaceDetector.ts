// lib/FaceDetector.ts
import * as faceapi from "@vladmandic/face-api";

type FaceDetectorCallback = (faces: number) => void;

export class FaceDetector {
  private video: HTMLVideoElement | null = null;
  private stream: MediaStream | null = null;
  private callback?: FaceDetectorCallback;
  private prevFaceCount = 0;
  private stopped = false;

  constructor(callback?: FaceDetectorCallback) {
    this.callback = callback;
  }

  async loadModels(path = "/models") {
    await faceapi.nets.tinyFaceDetector.loadFromUri(path);
  }

  async start() {
    this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
    this.video = document.createElement("video");
    this.video.autoplay = true;
    this.video.muted = true;
    this.video.playsInline = true;
    this.video.srcObject = this.stream;

    await this.video.play();
    this.stopped = false;
    this.detectLoop();
  }

  private async detectLoop() {
    if (!this.video || this.stopped) return;

    const detections = await faceapi.detectAllFaces(
      this.video,
      new faceapi.TinyFaceDetectorOptions()
    );

    const faceCount = detections.length;
    if (faceCount > 0 && this.prevFaceCount === 0) {
      this.callback?.(faceCount); // คนเข้ามา
    } else if (faceCount === 0 && this.prevFaceCount > 0) {
      this.callback?.(faceCount); // คนออกไปหมด
    }
    this.prevFaceCount = faceCount;

    requestAnimationFrame(() => this.detectLoop());
  }

  stop() {
    this.stopped = true;
    if (this.video?.srcObject) {
      (this.video.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
    }
    this.video = null;
    this.stream = null;
  }
}
