import { Sequelize } from "sequelize";

import AnnouncementOrderModel from "../models/AnnouncementOrder";
import AnnouncementImageModel from "../models/AnnouncementImage";
import { createTestDatabase } from "./setupTestDatabase";
import { syncAllCurrentAnnouncement } from "../services/announcementService";
import dayjs from "dayjs";

let sequelize: Sequelize;
let AnnouncementOrder: any;
let AnnouncementImage: any;

beforeAll(async () => {
    sequelize = await createTestDatabase();

    // init models
    AnnouncementOrder = AnnouncementOrderModel(sequelize);
    AnnouncementImage = AnnouncementImageModel(sequelize, AnnouncementOrder);

    // sync database
    await sequelize.sync({ force: true });
});

afterAll(async () => {
    await sequelize.close();
});

test("สามารถสร้าง AnnouncementOrder และ AnnouncementImage ได้", async () => {

});

describe("database test", () => {
    it("ลองสร้าง database", async () => {
        await AnnouncementOrder.create({
            messages: "ประกาศ test",
            start_time: dayjs().add(20, "seconds"),
        });

        await AnnouncementOrder.create({
            messages: "ประกาศ test",
            start_time: dayjs().subtract(30, "seconds"),
        });

        
        // const image = await AnnouncementImage.create({
        //     image_path: "path/to/image.png",
        //     order_id: order.id,
        // });

        // expect(image.order_id).toBe(order.id);
    })

    it("ลอง sync ข้อมูลการประกาศ", () => {
        syncAllCurrentAnnouncement()
    })
})