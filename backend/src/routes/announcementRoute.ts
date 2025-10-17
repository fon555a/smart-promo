import type { Request, Response } from "express"
import fs from "fs"

import express from "express"
import { addAnnouncement, askAnnouncement, getStartedAnnouncement } from "../controllers/announcementController"
import multer from "multer"
import path from "path"

const router = express.Router()
const uploadPath = path.join(__dirname, "../../uploads");

// ตรวจสอบว่าโฟลเดอร์ uploads มีอยู่หรือไม่ ถ้าไม่สร้าง
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPath); // เก็บไฟล์ที่ uploads/
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname)
        const uniqueName = crypto.randomUUID() + ext
        cb(null, uniqueName); // ตั้งชื่อไฟล์เอง
    }
});

const upload = multer({ storage });

router.use("/uploads", express.static(uploadPath))

router.post("/add_announcement", upload.array("images"), addAnnouncement)

router.post("/ask_announcement", askAnnouncement)

router.post("/get_started_announcements", getStartedAnnouncement)

router.get("/", (request: Request, response: Response) => {
    response.json({ message: "tesat25" })
    response.status(200).json({ success: true })
})

export default router