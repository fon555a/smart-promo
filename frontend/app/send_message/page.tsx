
'use client'
import { useRef, useState } from "react"
import SendMessage from "./components/SendMessage"
import SendImages from "./components/SendImages"
import SendSetting from "./components/SendSetting"
import { PickerValue } from "@mui/x-date-pickers/internals"
import Link from "next/link"
import toast, { Toaster } from "react-hot-toast"
import axios from "axios"
import dayjs, { Dayjs } from "dayjs"
import compressImage from "../../lib/compressImage"

type DateData = {
  startDateAndTime: PickerValue | null,
}



const SendMessagePage = () => {
  const [selectedImages, setImages] = useState<File[]>([])

  const [message, setMessage] = useState<string>("")
  const [step, setStep] = useState(1)

  const [dateData, setDateData] = useState<DateData>({
    startDateAndTime: null
  })

  const startTimeRef = useRef<Dayjs>(null)
  const isSendingRef = useRef(false)


  const isSameImage = (image: File, targetImage: File) => {
    return image.name === targetImage.name && image.size === targetImage.size && image.lastModified === targetImage.lastModified
  }

  const handleSelectedImages = (images: FileList) => {
    const allImages = Array.from(images)
    setImages((currentImages) => {
      const newImages = allImages.filter(image => !currentImages.some(ci => isSameImage(ci, image)))
      return [...currentImages, ...newImages]
    })
  }



  const sentDataToServer = async () => {
    console.log("Sent!!")
    const formData = new FormData()

    for (const image of selectedImages) {
      console.log("Size before compress:", image.size)
      const processedImage: Blob = await compressImage(image, {
        quality: 0.6
      })
      console.log("Size after compress:", processedImage.size)
      formData.append("images", processedImage, image.name)

    }

    const startTime = startTimeRef.current && startTimeRef.current.toISOString() || dayjs()
    console.log("sent start time:", startTime)
    const messageData = {
      text: message,

      settings: {
        timeSetting: {
          startTime: startTime,
        }
      }
    }

    formData.append("data", JSON.stringify(messageData))
    console.log("MEssageData:", messageData)


    try {
      const url = `/api/announcements/add_announcement`
      const response = await axios.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      })

      if (response.status !== 200) {
        console.log("⚠️ มีบางอย่างผิดปกติ", response.status);
        return false
      }

      console.log("✅ สำเร็จ", response.data);
      return response.data
    } catch (error) {
      console.error(error)
    }

    return true
  }


  const removeImage = (image: File) => {
    setImages(prev => prev.filter(item =>
      !isSameImage(item, image)
    ))
  }

  const renderInput = () => {
    switch (step) {
      case 1:

        return (
          <SendMessage
            onNext={() => {
              console.log("MEssage:", message)
              if (message === "") {
                toast.error("คุณยังไม่ได้ใส่ข้อความ!!!")
                return false
              }
              setStep(2)
            }}
            onSetMessage={(event) => setMessage(event.target.value)}
            message={message}
          />
        )
      case 2:

        return (
          <SendImages
            images={selectedImages}
            onNext={() => {
              setStep(3)
            }}
            onBack={() => setStep(1)}
            onSelectImages={handleSelectedImages}
            onDeleteButtonClicked={removeImage}
          />
        )
      case 3:

        return (
          <SendSetting
            onBack={() => setStep(2)}
            onNext={async () => {



              try {
                if (isSendingRef.current) {
                  toast.error("กรุณารอสักครู่")
                  return false
                }
                isSendingRef.current = true
                const responseData = await sentDataToServer()

                setTimeout(() => {
                  isSendingRef.current = false
                }, 2000)
                if (!responseData) {
                  console.log("Sent message error!!")
                  toast.error("ไม่สำเร็จ!!!")

                  return false
                }

                if (!responseData.success) {
                  if (responseData.isNotAnnouncement) {
                    toast.error("กรุณาป้อนข้อความใหม่ นี่ไม่ใช่ข้อความประกาศประชาสัมพันธ์")
                    return false
                  }
                  toast.error("ไม่สำเร็จ!!!")
                  return false
                }

                toast.success("ส่งข้อมูลสำเร็จ")

                setStep(4)

              } catch (error) {
                toast.error("เกิดข้อผิดพลาดในการส่งข้อมูล")
                console.error(error)
              } finally {
              }


            }}

            dateData={dateData}

            onStartDateChange={(date) => {
              setDateData(prev => ({ ...prev, startDateAndTime: date }))
              startTimeRef.current = date
              console.log("Current date:", date, date.toISOString())
            }}
          />
        )
      case 4:

        return (
          <div className="text-center">
            <h1 className="text-2xl text-primary font-bold">สำเร็จ!!!</h1>
            <p className="text-secondary mb-2">ตอนนี้ได้ส่งข้อมูลการประกาศสำเร็จแล้ว โปรดรอการประกาศเมื่อถึงเวลที่กำหนด</p>
            <Link href={"/"} className="bg-primary text-white px-4 py-1 text-md rounded-md">กลับไปยังหน้าแรก</Link>
          </div>
        )

      default:
        break;
    }
  }

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <Toaster />
      <div className="container-lg border-primary rounded-2xl p-5 border-3">
        {step === 1 || step === 2 ?
          <div>
            <div className="text-center">
              <h1 className="text-4xl text-primary font-bold">ส่งข้อความและรูปภาพ</h1>
              <p className="text-secondary">ส่งข้อความและรูปเพื่อให้สิ่งประดิษฐ์ประกาศข้อความด้วยเสียง</p>
              <p className="text-secondary">และแสดงผลรูปภาพ</p>

            </div>
          </div>
          :
          <div>
            {step === 3 &&
              <div className="mb-2">
                <h1 className="text-center text-4xl text-primary font-bold">ตั้งค่า</h1>
                <p className="text-secondary text-center">ในการประกาศจะประกาศแค่สองครั้งเท่านั้น</p>
              </div>
            }

          </div>
        }

        <div>
          {renderInput()}
        </div>

      </div>
      {/* back button */}
      <Link href={"/"} className="fixed bottom-0 text-lg left-0 m-5 bg-primary text-white rounded-md px-2 py-1">กลับไปยังหน้าแรก</Link>
    </div>
  )
}
export default SendMessagePage