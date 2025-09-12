"use client"

import ImageList from "./ImageList"

interface Props {
  onNext: () => void,
  onBack: () => void,
  images: File[],
  onSelectImages: (images: FileList) => void,
  onDeleteButtonClicked: (image: File) => void
}

const SendImages = ({ onNext, onBack, onSelectImages, images, onDeleteButtonClicked }: Props) => {

  return (
    <div>
      <h1 className="text-2xl text-primary font-bold">2. ส่งรูปภาพ</h1>
      <ImageList images={images} onSelectImages={onSelectImages} onDeleteButtonClicked={onDeleteButtonClicked}/>
      
      <div className="button-control mt-2 flex justify-between items-center">
        <button className="bg-primary cursor-pointer rounded-md text-white px-3 py-1" onClick={onBack}>ย้อนกลับ</button>
        <button className="bg-primary cursor-pointer rounded-md text-white px-5 py-1" onClick={onNext}>ต่อไป</button>

      </div>
    </div>
  )
}
export default SendImages