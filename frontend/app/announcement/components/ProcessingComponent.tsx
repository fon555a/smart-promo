'use client'
import Image from "next/image"
import { motion } from "framer-motion"

const MotionImage = motion(Image)


const ProcessingComponent = () => {

  return (
    <div>
      <div className="w-screen h-screen fixed justify-center">
        <div className="container-lg flex flex-col justify-center items-center gap-3 absolute bottom-0 left-0 right-0 mb-15">
          {/* <div className="bg-white border-3 border-primary flex flex-col justify-center text-center p-3 rounded-2xl">
            <Image
              src={"/icons/processingIcon.svg"}
              alt="processing-icon"

              width={150}
              height={150}
            />
            <p className="text-primary text-2xl">กำลังประมวลผล</p>

          </div> */}
          <motion.div

            className="bg-white border-3 border-primary flex flex-col justify-center text-center p-3 rounded-2xl"
            initial={{ y: 200 }}   // เริ่มจากข้างล่าง + จาง
            animate={{ y: 0 }}     // เลื่อนขึ้น + fade in
            transition={{ duration: 0.75, ease: "easeOut" }}
            style={{ willChange: "transform" }}
          >
            <MotionImage
              src={"/icons/processingIcon.svg"}
              alt="processing-icon"

              width={150}
              height={150}
              animate={{ rotate: 360 }}
              style={{ willChange: "transform" }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: "linear"
              }}
            />
            <p className="text-primary text-2xl">กำลังประมวลผล</p>
          </motion.div>


        </div>

      </div>
    </div>
  )
}
export default ProcessingComponent