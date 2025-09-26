// test/setupDatabase.ts
import { Sequelize } from "sequelize";
import AnnouncementOrderModel from "../models/AnnouncementOrder";
import AnnouncementImageModel from "../models/AnnouncementImage";

export const createTestDatabase = async () => {
  const sequelize = new Sequelize('sqlite::memory:', {
    logging: false, // ปิด log เวลา test
  });

  // init models
  const AnnouncementOrder = AnnouncementOrderModel(sequelize)
  AnnouncementImageModel(sequelize, AnnouncementOrder)

  // sync database
  await sequelize.sync({ force: true });

  return sequelize;
};
