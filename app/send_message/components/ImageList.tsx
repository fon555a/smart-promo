'use client'

import Image from "next/image"
import { useRef } from "react"

interface Props {
    images: File[],
    onSelectImages: (images: FileList) => void,
    onDeleteButtonClicked: (image: File) => void
}

const ImageList = ({ images, onSelectImages, onDeleteButtonClicked }: Props) => {
    const fileInputRef = useRef<HTMLInputElement | null>(null)

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files
        console.log("File:", files)

        if (!files) {
            return false
        }

        onSelectImages(files)
        // onSelectImages()
    }

    return (
        <>
            <input type="file" onChange={handleFileChange} ref={fileInputRef} accept=".jpg, .jpeg" multiple name="" id="" className="hidden" />

            {images.length === 0 ?
                <div className="container bg-secondary p-8 rounded-md flex justify-center items-center">
                    <div className="text-center">
                        <h1 className="text-primary text-2xl font-bold">ยังไม่มีรูปภาพ</h1>
                        <p className="text-secondary">กดปุ่มด้านล่างเพื่อเพิ่มรูปภาพ หรือ Drop รูปภาพตรงนี้</p>
                        <button onClick={() => fileInputRef.current?.click()} className="bg-primary cursor-pointer text-white font-bold rounded-md px-3 py-1">เพิ่มรูปภาพ</button>
                    </div>
                </div>
                :
                <div className="border-primary grid grid-cols-4 gap-2 border-3 rounded-md h-35 overflow-auto p-2">
                    {images.map((image: File, index: number) => {
                        const previewImage = URL.createObjectURL(image)
                        return (
                            <button key={index} onClick={() => onDeleteButtonClicked(image)} className="cursor-pointer group col relative w-25 aspect-[16/9] rounded border-primary border-2">
                                <div className="opacity-0 group-hover:opacity-100 inset-0 absolute  bg-primary text-white z-2 w-full h-full flex items-center justify-center ">
                                    ลบ
                                </div>
                                <Image
                                    src={previewImage}
                                    fill
                                    alt="just test image"
                                    className="object-cover group-hover:opacity-0"
                                />
                            </button>
                        )
                    })}

                    <button onClick={() => fileInputRef.current?.click()} className="relative col cursor-pointer flex flex-col justify-center items-center text-center w-25 aspect-[16/9] rounded border-primary border-2">
                        <p className="font-bold text-primary text-2xl m-0 h-5">+</p>
                        <p className="font-bold text-primary">เพิ่มรูปภาพ</p>
                    </button>

                </div>
            }

        </>

    )
}
export default ImageList