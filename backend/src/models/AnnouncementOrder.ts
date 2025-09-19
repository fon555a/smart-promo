import { DataTypes } from "sequelize"
import sequelize from "../database"



const AnnouncementOrder = sequelize.define("AnnouncementOrder", {
    messages: {
        type: DataTypes.STRING,
        allowNull: false
    },
    start_time: {
        type: DataTypes.DATE,
        allowNull: false
    },
    end_time: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {tableName: "announcement_order"}) as any

export default AnnouncementOrder