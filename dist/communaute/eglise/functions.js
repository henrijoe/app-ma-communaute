"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../db");
//   
const ajouterEglise = (data) => {
    const values = [
        data.nomEglise,
        data.idComptabilite,
        data.idUtilisateur
    ];
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `INSERT INTO eglise(nomEglise,idComptabilite,idUtilisateur) VALUES (?,?,?)`;
            const egliseData = yield (0, db_1._executeSql)(sql, [...values]);
            resolve(egliseData.insertId);
        }
        catch (error) {
            reject(error);
        }
    }));
};
/**
 * recupererer toute les eglises
 * @returns
 */
const recupEglise = () => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `SELECT * FROM eglise ORDER BY idEglise ASC ;`;
            const eglise = yield (0, db_1._selectSql)(sql, []);
            resolve(eglise);
        }
        catch (error) {
            reject(error);
        }
    }));
};
/**
 * recupererer toute les eglises
 * @returns
 */
const recupEgliseById = (id) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `SELECT * FROM eglise WHERE idEglise =? ;`;
            const eglise = yield (0, db_1._selectSql)(sql, [id]);
            resolve(eglise);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const supprimerEglise = (idEglise) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `DELETE FROM eglise WHERE idEglise = ?`;
            yield (0, db_1._executeSql)(sql, [idEglise]);
            resolve(true);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const modifierEglise = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `UPDATE eglise SET nomEglise=?,idComptabilite=? WHERE idEglise=?`;
            yield (0, db_1._executeSql)(sql, [
                data.nomEglise,
                data.idComptabilite,
                data.idEglise,
            ]);
            resolve(true);
        }
        catch (error) {
            reject(error);
        }
    }));
};
exports.default = {
    recupEglise,
    ajouterEglise,
    supprimerEglise,
    modifierEglise,
    recupEgliseById
};
//# sourceMappingURL=functions.js.map