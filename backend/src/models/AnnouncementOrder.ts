import { DataTypes, Sequelize } from "sequelize";

export default (sequelize: Sequelize) => {
    const AnnouncementOrder = sequelize.define("AnnouncementOrder", {
        messages: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        start_time: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    }, { tableName: "announcement_order" });

    return AnnouncementOrder;
};
