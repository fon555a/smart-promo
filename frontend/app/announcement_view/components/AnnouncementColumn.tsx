'use client'

import Image from "next/image"
import ImageList from "../../../components/ImageList"

interface Props {
    announcementAt: string,
    imagesList: string[],
    text: string
}

const AnnouncementColumn = ({ announcementAt, imagesList, text }: Props) => {
    const backendUrl = process.env.NEXT_PUBLIC_DOMAIN_URL
    console.log("Domain url:", backendUrl)
    console.log("Images url:", imagesList)
    const previewImages = imagesList.map((image: string) => {
        return backendUrl + "/api/announcements" + image
    })

    return (
        <div className="flex flex-col justify-between items-center border-primary border-2 px-5 py-2 rounded-md gap-5 ">
            <div className="information w-full">
                <p className="text-secondary">ประกาศเมื่อ {announcementAt}</p>
                <p className=" text-xl text-primary max-w-100">{text}</p>
            </div>
            <div className="image w-full">
                {imagesList?.length === 0 ?
                    <div className="">
                        <h1 className="text-secondary text-center">ไม่มีรูปภาพ</h1>
                    </div>
                    :
                    <div className=" h-50 relative border-2 border-primary rounded-md bg-black">
                        <ImageList imagesList={previewImages} />
                        <p className="absolute bottom-0 left-0 right-0 bg-gray-500/50 text-white text-center">กดเพื่อดู</p>
                    </div>
                }
            </div>
        </div>
    )
}
export default AnnouncementColumn