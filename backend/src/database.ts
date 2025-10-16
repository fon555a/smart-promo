import { Sequelize } from "sequelize"

import "dotenv/config"

const database = process.env.MYSQL_DATABASE as string 
const user = process.env.MYSQL_USER as string
const password = process.env.MYSQL_PASSWORD as string || ""
const port = process.env.MYSQL_PORT as string

const sequelize = new Sequelize(database, user, password, {
    host: process.env.MYSQL_HOST as string,
    dialect: "mysql",
    logging: false,
    // port: Number(port)
})

// const sequelize = new Sequelize("smartpr_announcement", "smartpr_fon", "FONggez2019", {
//     host: "localhost",
//     dialect: "mysql",
//     logging: false,
//     // port: Number(port)
// })

export default sequelize