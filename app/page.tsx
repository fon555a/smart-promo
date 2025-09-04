import Link from "next/link"

export default function Home() {
  return (
    <div className="w-screen h-screen bg-[#E4E4E4] flex justify-center items-center">
      <div className="bg-white rounded-lg">
        <h1>ยินดีตอนรับสู่เว็บสิ่งประดิษฐ์ของเรา</h1>
        <p>นี่คือเว็บไซต์ที่จัดการสิ่งประดิษฐ์ประชาสัมพันธ์
          และเชื่อมต่อกับสิ่งประดิษฐ์โดยตรง
        </p>

        <div>
          <div>
            <h3>ฟีเจอร์</h3>
            <div className="row">
              <div className="column">
                <div className="image">
                  รูปภาพ
                </div>
                <Link href={"/about"}>
                  <p>ประกาศข้อความและรูปภาพ</p>
                  <p>ส่งข้อความและรูปภาพ เพื่อให้สิ่งประดิษฐ์ประกาศ</p>
                </Link>

              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
