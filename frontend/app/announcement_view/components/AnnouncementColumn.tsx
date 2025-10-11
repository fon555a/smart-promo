'use client'

import Image from "next/image"

interface Props {
    announcementAt: string,
    imagesList: string[],
    text: string
}

const AnnouncementColumn = ({ announcementAt, imagesList, text }: Props) => {
    const hostname = window.location.hostname
    const backendPort = process.env.NEXT_PUBLIC_SERVER_PORT
    const backendUrl = `http://${hostname}:${backendPort}`

    const previewImages = imagesList.map((image: string) => {
        return backendUrl + "/api/announcements" + image
    })

    return (
        <div className="flex flex-col justify-between items-center border-primary border-2 px-5 py-2 rounded-md gap-5 sm:gap-23 sm:flex-row">
            <div className="information">
                <p className="text-secondary">ประกาศเมื่อ {announcementAt}</p>
                <p className="text-secondary">{text}</p>
            </div>
            <div className="image">
                {imagesList?.length === 0 ?
                    <div className="flex justify-center items-center w-25 col aspect-[16/9]">
                        <h1 className="text-secondary">ไม่มีรูปภาพ</h1>
                    </div>
                    :
                    <button className="relative overflow-hidden cursor-pointer group col relative w-25 aspect-[16/9] rounded border-primary border-2 flex justify-center items-center">
                        {/* <img className="absolute inset-0 w-full h-full object-cover -z-10" src={previewImages[0]} alt="preview image" /> */}
                        <div className="z-10">
                            <p className="text-primary">{imagesList?.length} รูปภาพ</p>
                            <p className="text-secondary">กดเพื่อดู</p>
                        </div>
                    </button>
                }
            </div>
        </div>
    )
}
export default AnnouncementColumn