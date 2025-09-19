import { DataTypes } from "sequelize"
import sequelize from "../database"
import AnnouncementOrder from "./AnnouncementOrder"

const AnnouncementImage = sequelize.define("AnnouncementImage", {
    image_path: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: AnnouncementOrder,
            key: "id"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    }
}, {tableName: "announcement_images"})

export default AnnouncementImage