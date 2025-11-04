import Image from "next/image"

interface Props {
    text?: string,
}

const ListeningComponent = ({ text }: Props) => {

    return (
        <div className="w-screen h-screen fixed justify-center">
            
            <div className="container-lg flex flex-col justify-center items-center gap-3 absolute bottom-0 left-0 right-0 mb-15">
                <div className="bg-white border-3 border-primary flex flex-col justify-center text-center p-3 rounded-2xl">
                    <Image
                        src={"/microphone.svg"}
                        alt="microphone icon"
                        width={150}
                        height={150}
                    />

                    <p className="text-primary text-2xl">กำลังฟังเสียง</p>
                </div>
                {text !== "" && 
                <div className="bg-white border-3 border-primary w-[80%] text-center px-3 py-1 text-2xl rounded-2xl">
                    <p className="text-primary">ข้อความ</p>
                    <p className="text-secondary break-word ">{text}</p>
                </div>
                }
                
            </div>

        </div>
    )
}
export default ListeningComponent