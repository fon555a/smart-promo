import mysql from 'mysql2/promise';

export default async function getGetConnection() {
    const connection = await mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database:"smart_promo_database"
    })
    return connection
}