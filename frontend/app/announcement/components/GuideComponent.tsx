const GuideComponent = () => {
    return (
        <div className="fixed top-0 bottom-0 mx-5 flex justify-center items-center">
            <div className="bg-white outline-3 outline-primary rounded-md p-5 flex-row gap-2 text-primary">
                <h1 className="text-3xl text-center font-semibold">ขั้นตอนการใช้งาน</h1>
                <div>
                    <h1 className="text-2xl font-semibold">สำหรับผู้ประกาศ</h1>
                    <ul className="text-xl">
                        <li>1. สแกน QR Code</li>
                        <li>2. กดเมนู ประกาศข้อความและรูปภาพ</li>
                        <li>3. ใส่ข้อความและรูปภาพที่ต้องการ</li>
                        <li>4. กำหนดเวลาในการประกาศ</li>
                    </ul>
                </div>
                <div>
                    <h1 className="text-2xl font-semibold">สำหรับผู้รับชม</h1>
                    <ul className="text-xl">
                        <li>1. มองกล้อง แล้วรอจนกว่าจะขึ้นข้อความว่า กำลังฟังเสียง</li>
                        <li>2. ถามคำถามที่ต้องการ อย่างเช่น วันนี้มีข่าวประชาสัมพันธ์อะไรบ้าง</li>
                        <li>3. รอสิ่งประดิษฐ์ประมวลผล</li>
                        <li>4. สิ่งประดิษฐ์จะตอบผ่านเสียงลำโพง</li>
                    </ul>
                </div>
            </div>

        </div>
    )
}
export default GuideComponent