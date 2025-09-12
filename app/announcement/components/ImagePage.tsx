import Image from "next/image"

interface Props {
    image_path: string | null
}

const ImagePage = ({ image_path }: Props) => {
  return (
    <div className="w-screen h-screen flex justify-center items-center bg-black">
        {image_path ?
        <Image
        src={image_path}
        alt="no image"
        className="object-contain"
        fill

        /> 

        :
        <h1 className="text-white text-4xl font-bold">ยังไม่มีรูปภาพ</h1>
    }
        
    </div>
  )
}
export default ImagePage