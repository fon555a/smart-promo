"use client"

interface Props {
  onNext: () => void,
  onSetMessage: (event: React.ChangeEvent<HTMLTextAreaElement>) => void,
  message: string
}

const SendMessage = ({onNext, onSetMessage, message}: Props) => {
  return (
    <div>
      <h1 className="font-bold text-2xl text-primary">1. ป้อนข้อความ</h1>
      <textarea name="" id="" placeholder="ป้อนข้อความ" value={message} onChange={onSetMessage} className="outline-primary focus:outline-3 h-25 border-primary container bg-secondary rounded-md p-2 text-secondary"></textarea>
      
      <div className="button-control flex justify-center container">
        <button className="cursor-pointer bg-primary text-white rounded-md font-bold text-xl px-[3rem] py-2 lg:px-[8rem]" onClick={onNext}>ต่อไป</button>

      </div>
    </div>
  )
}
export default SendMessage