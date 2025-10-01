import Image from "next/image";
import Link from "next/link"

export default function Home() {
  return (
    <div className="w-screen h-screen bg-[#E4E4E4] flex justify-center items-center">
      <div className="bg-white rounded-lg container h-[75%] py-[4.5rem] border-primary border-3">
        <h1 className="font-bold text-[2rem] text-center text-primary">ยินดีตอนรับสู่เว็บสิ่งประดิษฐ์ของเรา</h1>
        <p className="text-center text-secondary">นี่คือเว็บไซต์ที่จัดการสิ่งประดิษฐ์ประชาสัมพันธ์
          และเชื่อมต่อกับสิ่งประดิษฐ์โดยตรง
        </p>
      
        <div className="flex justify-between items-center px-3 sm:px-[8rem]">
          <div className="flex-row">
            <h3 className="font-bold text-2xl text-primary">ฟีเจอร์</h3>
            <div className="flex-row">
              <div className="flex  flex-row rounded-lg border-[#0089D3] border-3">
                <div className="image bg-[#0089D3] w-[94px] h-[94px] flex flex-none justify-center items-center">
                  <Image
                  src={"/megaphone.png"}
                  alt="logo"
                  width={74}
                  height={74}
                  />
                </div>
                <Link href={"/send_message"} className="flex flex-col justify-center px-2">
                  <p className="font-bold text-lg text-primary m-0">ประกาศข้อความและรูปภาพ</p>
                  <p className="text-secondary">ส่งข้อความและรูปภาพ เพื่อให้สิ่งประดิษฐ์ประกาศ</p>
                </Link>

              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
