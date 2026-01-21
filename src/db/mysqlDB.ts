const dotenv = require ("dotenv");
dotenv.config();
const mysql = require("mysql2");

// const mysqlDB = mysql.createPool({
//     connectionLimit: 10,
//     host: 'localhost',
    

//     // user: 'qonu5103',
//     // password: 'root',
//     // database: 'qonu5103_ma-communaute',

//     // en local
//     user: 'root',
//     password: 'root',
//     database: 'ma-communaute',
// })



 const mysqlDB = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
});

console.log("🚀 ~ file: mysqlDB.ts:16 ~ database:")
mysqlDB.getConnection((err: any, connection: any) => {
    if (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Database connection was closed.')
        }
        else if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('Database has too many connections.')
        }
        else if (err.code === 'ECONNREFUSED') {
            console.error('Database connection was refused.')
        }
        else
            console.error('error ++++++++', err)

    } else {
        console.log('Sucessfully connected to the mySQL database!')
    }

    if (connection) connection.release()
    return
})

export default mysqlDB;
