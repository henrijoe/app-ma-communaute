import { MysqlError, OkPacket } from "mysql";
import mysqlDB from "./mysqlDB";
// const db = require("./mysqlDB");

const execCmd = mysqlDB.query.bind(mysqlDB);

export const _executeSql = (sql: string, param: any) => {
  return new Promise((resolve, reject) => {
    try {
      execCmd(sql, param, function (this: any, error: MysqlError, result: OkPacket) {
        if (error) return reject(error);
        resolve(result === undefined ? { affectedRows: this.changes } : result);
      });
    } catch (err) {
      reject(err);
    }
  });
};


export const _selectSql:any = (sql: string, param: (string|number)[]) => {
  return new Promise((resolve, reject) => {
    try {
        execCmd(sql, param, (error: MysqlError , rows: any) => {
        if (error) return reject(error);
        resolve(rows);
      });
    } catch (err) {
      console.error(err);
      reject(err);
    }
  });
};

// export default db;
