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
const ajouterComptablilite = (data) => {
    const values = [
        data.nomComptabilite,
        data.entreeComptabilite,
        data.sortieComptabilite,
        data.dateComptabilite,
        data.observationComptabilite,
        data.idUtilisateur
    ];
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `INSERT INTO comptabilite(nomComptabilite,entreeComptabilite,sortieComptabilite,dateComptabilite,observationComptabilite,idUtilisateur) VALUES (?,?,?,?,?,?)`;
            const comptabilite = yield (0, db_1._executeSql)(sql, [...values]);
            resolve(comptabilite.insertId);
        }
        catch (error) {
            reject(error);
        }
    }));
};
/**
 * recupererer toute les comptabilite
 * @returns
 */
const recupComptabilite = () => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `SELECT * FROM comptabilite ORDER BY idComptabilite ASC ;`;
            const comptabilite = yield (0, db_1._selectSql)(sql, []);
            resolve(comptabilite);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const recupComptabiliteById = (id) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `SELECT * FROM comptabilite WHERE idComptabilite =? ;`;
            const comptabilite = yield (0, db_1._selectSql)(sql, [id]);
            resolve(comptabilite);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const supprimerComptabilite = (idComptabilite) => {
    return new Promise((resolve, reject) => {
        const sql = `DELETE FROM comptabilite WHERE idComptabilite = ?`;
        (0, db_1._executeSql)(sql, [idComptabilite])
            .then(() => {
            resolve(true);
        })
            .catch((error) => {
            reject(error);
        });
    });
};
const modifierComptabilite = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `UPDATE comptabilite SET nomComptabilite=?, entreeComptabilite=?,sortieComptabilite=?,dateComptabilite=?,observationComptabilite=?,observationComptabilite=?,idUtilisateur=? WHERE idComptabilite=?`;
            yield (0, db_1._executeSql)(sql, [
                data.nomComptabilite,
                data.entreeComptabilite,
                data.sortieComptabilite,
                data.dateComptabilite,
                data.observationComptabilite,
                data.idComptabilite,
                data.idUtilisateur
            ]);
            resolve(true);
        }
        catch (error) {
            reject(error);
        }
    }));
};
exports.default = {
    ajouterComptablilite,
    recupComptabilite,
    supprimerComptabilite,
    modifierComptabilite,
    recupComptabiliteById
};
//# sourceMappingURL=functions.js.map