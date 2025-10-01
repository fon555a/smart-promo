import QRCode from "qrcode"
import { useEffect, useRef } from "react"

interface Props {
    url: string
}

const QRCodeComponent = ({ url }: Props) => {
    const imageRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        if (url) {
            QRCode.toCanvas(imageRef.current, url, {
                width: 200
            })
        }
    }, [url])

    return (
        <div className="fixed flex justify-center z-2 top-0 left-0 right-0">
            <div className="bg-white border-3 border-primary items-center flex flex-col justify-center text-center p-2 rounded-2xl">
                <canvas ref={imageRef}></canvas>
                <p className="text-primary text-2xl">สแกน QR Code </p>
                <p className="text-primary text-2xl">เพื่อส่งข้อมูลประชาสัมพันธ์</p>

            </div>

        </div>
    )
}
export default QRCodeComponent