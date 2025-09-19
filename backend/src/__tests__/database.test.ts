import dayjs from "dayjs"
import sequelize from "../database.ts"
import { createAnnouncement } from "../services/announcementService.ts"
// import expressApp from "../server.ts"
import request from "supertest"
import { start } from "repl"
import { convertTextToSpeech } from "../services/ttsService.ts"
import { generateText } from "../services/aiService.ts"


// beforeAll(async () => {
//     await sequelize.sync({force: false})
// })

// afterAll(async () => {
//     await sequelize.close()
    
// })

// test("ลองแปลงเสียง", async () => {
//     const status = await convertTextToSpeech("")
//     console.log("status:", status)
//     expect(status).toBe(200)
// })

// describe("ลองประกาศ", () => {
//     it("ผ่านเถอะขอร้อง", async () => {
//         const response = await request(expressApp)
//         .post("/api/announcements/add_announcement")
//         .send({
//             text: "wompwomp",
//             imageFiles: [],
//             settings: {
//                 timeSetting: {
//                     startTime: dayjs().toISOString(),
//                     endTime: dayjs().toISOString()
//                 }
//             }
//         })
//         .set("Accept", "application/json")

//         expect(response.status).toBe(200)
        
//     })
// })

test("ลองใช้ ai", async () => {
    await generateText("สวัสดีครับ")
}, 50000)

// test("ลองเพิ่มข้อมูลใน database", async () => {
//     const text = "wompwomp"
//     const newOrder = await createAnnouncement({
//         text: text,
//         imageFiles: [],
//         settings: {
//             timeSetting: {
//                 startTime: dayjs().toISOString(),
//                 endTime: dayjs().toISOString()
//             }
//         }
//     })

//     expect(newOrder).toBeDefined()
//     expect(newOrder.messages).toBe(text)
// })