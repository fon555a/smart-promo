
'use client'
import { useState } from "react"
import SendMessage from "./components/SendMessage"
import SendImages from "./components/SendImages"
import SendSetting from "./components/SendSetting"
import { PickerValue } from "@mui/x-date-pickers/internals"
import { addAnnouncement } from "../actions/announcement"
import Link from "next/link"
import toast, { Toaster } from "react-hot-toast"

type DateData = {
  startDateAndTime: PickerValue | null,
  endDateAndTime: PickerValue | null
}



const SendMessagePage = () => {
  const [selectedImages, setImages] = useState<File[]>([])

  const [message, setMessage] = useState<string>("")
  const [step, setStep] = useState(1)

  const [dateData, setDateData] = useState<DateData>({
    startDateAndTime: null,
    endDateAndTime: null
  })

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



  const sendDataToServer = async () => {
    await addAnnouncement({
      messages: message,
      imageFiles: selectedImages,

      settings: {
        timeSetting: {
          startDateAndTime: dateData.startDateAndTime?.toISOString(),
          endDateAndTime: dateData.endDateAndTime?.toISOString()
        }
      }
    })
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

              if (!dateData.startDateAndTime) return toast.error("คุณยังไม่ได้ตั้งค่าเวลาเริ่มต้นการประกาศ");
              if (!dateData.endDateAndTime) return toast.error("คุณยังไม่ได้ตั้งค่าเวลาจบการประกาศ");

              setStep(4)

              try {
                await sendDataToServer()
                toast.success("สำเร็จ!!!")

              } catch (error) {
                toast.error("เกิดข้อผิดพลาดในการส่งข้อมูล")
                console.error(error)
              }

            }}

            dateData={dateData}

            onStartDateChange={(date) => setDateData(prev => ({ ...prev, startDateAndTime: date }))}
            onEndDateChange={(date) => setDateData(prev => ({ ...prev, endDateAndTime: date }))}
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
              <div>
                <h1 className="text-center text-4xl text-primary font-bold mb-2">ตั้งค่า</h1>
              </div>
            }

          </div>
        }

        <div>
          {renderInput()}
        </div>

      </div>
    </div>
  )
}
export default SendMessagePage