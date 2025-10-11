
import Link from "next/link"
import AnnouncementRow from "./components/AnnouncementRow"

const AnnouncementViewPage = () => {    

    return (
        <div className=" flex justify-center items-center">
            <div className="container-sm rounded-2xl  p-5  h-screen">
                <h1 className="text-3xl pt-10 font-semibold text-primary text-center">ข่าวประชาสัมพันธ์ทั้งหมด</h1>
                <p className="text-secondary text-center">ข่าวประชาสัมพันธ์ที่เคยประกาศไปแล้วทั้งหมด</p>
                
                <AnnouncementRow/>
                
            </div>
            <Link href={"/"} className="fixed left-0 bottom-0 m-5 bg-primary text-white px-2 py-1 text-lg rounded-md">กลับไปที่หน้าแรก</Link>

        </div>
    )
}
export default AnnouncementViewPage