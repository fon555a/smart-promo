// components/FaceDetectorComponent.tsx
"use client";

import { useEffect, useRef } from "react";
import { FaceDetector } from "../../../lib/FaceDetector";

type Props = {
  onFaceEnter?: () => void;
  onFaceLeave?: () => void;
};

export default function FaceDetectorComponent({ onFaceEnter, onFaceLeave }: Props) {
  const detectorRef = useRef<FaceDetector | null>(null);

  useEffect(() => {
    console.log("Change!!! state!!")
    const detector = new FaceDetector((faces) => {
      if (faces > 0 && onFaceEnter) onFaceEnter();
      else if (faces === 0 && onFaceLeave) onFaceLeave();
    });

    detector.loadModels("/models").then(() => detector.start());
    detectorRef.current = detector;

    return () => detectorRef.current?.stop();
  }, []);

  return null; // ไม่ต้อง render UI
}
