import { Sequelize } from "sequelize"

const sequelize = new Sequelize("smart_promo_database", "root", "", {
    host: "localhost",
    dialect: "mysql",
    logging: false
})

export default sequelize