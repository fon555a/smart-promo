// models/AnnouncementImage.ts
import { DataTypes, Sequelize } from "sequelize";

export default (sequelize: Sequelize, AnnouncementOrder: any) => {
    const AnnouncementImage = sequelize.define("AnnouncementImage", {
        image_path: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        order_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: AnnouncementOrder,
                key: "id",
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        },
    }, { tableName: "announcement_images" });

    return AnnouncementImage;
};
