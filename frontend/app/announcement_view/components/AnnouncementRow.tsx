'use client'
import { useEffect, useState } from "react"
import AnnouncementColumn from "./AnnouncementColumn"
import axios from "axios"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"

dayjs.extend(utc)
dayjs.extend(timezone)

type AnnouncementData = {
    id: number,
    images: string[],
    startTime: string,
    text: string
}

type AnnouncementsList = {
    today: AnnouncementData[],
    yesterday: AnnouncementData[],
    other: AnnouncementData[]
}

const AnnouncementRow = () => {
    const [announcementsList, setAnnouncementsList] = useState<AnnouncementsList>({
        today: [],
        yesterday: [],
        other: []
    })

    const getAnnouncementData = async (): Promise<AnnouncementData[] | false> => {
        const hostname = window.location.hostname
        console.log("Host name:", hostname)
        try {
            const response = await fetch("/api/announcements/get_started_announcements", {
                method: "post",
                headers: { "Content-Type": "application/json" },
            })
            
            if (!response.ok) {
                console.error("Fetch error status:", response.status)
                return false
            }
            const announcementData = await response.json()

            return announcementData
        } catch (error) {
            console.error(error)
            return false
        }
    }

    const loadAnnouncementData = async () => {
        const announcementData = await getAnnouncementData()

        if (!announcementData) {
            console.error("Cannot get announcement data.")
            return false
        }

        const dataList: AnnouncementsList = {
            today: [],
            yesterday: [],
            other: []
        }
        const now = dayjs().startOf('day')         // วันนี้ 00:00
        const yesterday = dayjs().subtract(1, 'day').startOf('day') // เมื่อวาน 00:00

        announcementData.forEach(data => {
            const target = dayjs(data.startTime)

            if (target.isSame(now, 'day')) {
                dataList.today.push(data)
            } else if (target.isSame(yesterday, 'day')) {
                dataList.yesterday.push(data)
            } else {
                dataList.other.push(data)
            }
        })
        console.log("AnnouncementData:", announcementData)
        setAnnouncementsList(dataList)
    }
    useEffect(() => {
        loadAnnouncementData()
    }, [])

    const loadColumns = (announcements: AnnouncementData[]) => {

        return announcements.map((data) => {
            const startTime = dayjs.utc(data.startTime).tz("Asia/Bangkok")

            const formatted = startTime.format("DD/MM/YYYY HH:mm")
            return <AnnouncementColumn
                key={data.id}
                text={data.text}
                announcementAt={formatted}
                imagesList={data.images}
            />
        })

    }

    return (
        <div className="flex flex-col gap-2 mt-5 pb-5">
            {/* วันนี้ */}
            {announcementsList.today.length > 0 &&
                <div className="row">
                    <h1 className="text-primary text-lg font-bold">วันนี้</h1>
                    <div className="flex flex-col gap-2">
                        {loadColumns(announcementsList.today)}
                    </div>
                </div>
            }

            {/* เมื่อวาน */}
            {announcementsList.yesterday.length > 0 &&
                <div className="row">
                    <h1 className="text-primary text-lg font-bold">เมื่อวาน</h1>
                    <div className="flex flex-col gap-2">
                        {loadColumns(announcementsList.yesterday)}
                    </div>
                </div>
            }

            {/* อื้นๆ */}
            {announcementsList.other.length > 0 &&
                <div className="row">
                    <h1 className="text-primary text-lg font-bold">อื่นๆ</h1>
                    <div className="flex flex-col gap-2">
                        {loadColumns(announcementsList.other)}
                    </div>
                </div>
            }

        </div>
    )
}
export default AnnouncementRow