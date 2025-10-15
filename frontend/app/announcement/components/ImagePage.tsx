'use client'
import { useEffect, useState } from "react"

type Props = {
  imagesList?: string[],
  interval?: number
}


const ImagePage = ({ imagesList, interval = 3000 }: Props) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  useEffect(() => {
    if (imagesList.length === 0) return;

    const newId = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % imagesList.length)
    }, interval)
    return () => clearInterval(newId)
  }, [imagesList])

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-black">
      {imagesList[currentIndex] ?
        <img
          src={imagesList[currentIndex]}
          alt="test-image"
          className="fixed top-0 left-0 w-screen h-screen object-contain object-center bg-black z-2"

        />
        // <Image
        //   src={imagesList[currentIndex]}
        //   alt="no image"
        //   className="object-contain relative"
        //   fill

        // />

        :
        <h1 className="text-white text-4xl font-bold">ยังไม่มีรูปภาพ</h1>
      }

    </div>
  )
}
export default ImagePage