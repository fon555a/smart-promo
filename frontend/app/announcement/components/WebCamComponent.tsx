'use client'
import { useEffect, useRef } from 'react'

export default function WebCamComponent() {
    const videoRef = useRef<HTMLVideoElement | null>(null)

    useEffect(() => {
        const initCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true })
                if (videoRef.current) {
                    videoRef.current.srcObject = stream
                }
            } catch (err) {
                console.error('Cannot access camera:', err)
            }
        }

        initCamera()
    }, [])

    return (
        <div className="fixed right-0 z-2 top-0 mx-15 w-100 h-100">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                className="absolute max-w-full max-h-full rounded-md outline-3 outline-primary"
                style={{
                    transform: 'scaleX(-1)'
                }}
            />
        </div>
    )
}
