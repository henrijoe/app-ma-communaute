"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._selectSql = exports._executeSql = void 0;
const db = require("./mysqlDB");
const execCmd = db.query.bind(db);
const _executeSql = (sql, param) => {
    return new Promise((resolve, reject) => {
        try {
            execCmd(sql, param, function (error, result) {
                if (error)
                    return reject(error);
                resolve(result === undefined ? { affectedRows: this.changes } : result);
            });
        }
        catch (err) {
            reject(err);
        }
    });
};
exports._executeSql = _executeSql;
const _selectSql = (sql, param) => {
    return new Promise((resolve, reject) => {
        try {
            execCmd(sql, param, (error, rows) => {
                if (error)
                    return reject(error);
                resolve(rows);
            });
        }
        catch (err) {
            console.error(err);
            reject(err);
        }
    });
};
exports._selectSql = _selectSql;
exports.default = db;
//# sourceMappingURL=index.js.map