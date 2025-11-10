import axios from "axios";
import "dotenv/config"
import { isAnnouncementText } from "../controllers/announcementController"

jest.setTimeout(10000);
test("AI กรองข้อความ test", async () => {
    const isAnnouncement = await isAnnouncementText("ประกาศ วันนี้จะมีขนมมาขาย่ที่แผนกคอมพิวเตอร์นะคะ ในช่วงเวลา 7 โมง")
    console.log("Is announcement:", isAnnouncement)
});

