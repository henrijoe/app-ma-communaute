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
const ajouterNaissance = (data) => {
    const values = [
        data.nomCoupleNaissance,
        data.dateNaissance,
        data.lieuNaissance,
        data.nomEnfantNaissance,
        data.datePresentationNaissance,
        data.idUtilisateur
    ];
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // const sqlCheck = `SELECT COUNT(*) as count FROM naissance WHERE nomNaissance = ?`;
            // const [result] = await _selectSql(sqlCheck, [data.nomNaissance]);
            // if (result.count > 0) {
            //     // Si les libellés existent déjà, rejeter avec un message approprié
            //     return reject(new Error('Cette naissance existe déjà.'));
            //   }
            const sql = `INSERT INTO naissance(nomCoupleNaissance,dateNaissance,lieuNaissance,nomEnfantNaissance,datePresentationNaissance,idUtilisateur) VALUES (?,?,?,?,?,?)`;
            const naissanceData = yield (0, db_1._executeSql)(sql, [...values]);
            resolve(naissanceData.insertId);
        }
        catch (error) {
            reject(error);
        }
    }));
};
/**
 * recupererer toute les naissances
 * @returns
 */
const recupNaissance = () => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `SELECT * FROM naissance ORDER BY idNaissance ASC ;`;
            const naissance = yield (0, db_1._selectSql)(sql, []);
            resolve(naissance);
        }
        catch (error) {
            reject(error);
        }
    }));
};
// Fetcher une seule naissance
const recupNaissanceId = (id) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `SELECT * FROM naissance WHERE idNaissance =? ;`;
            const naissance = yield (0, db_1._selectSql)(sql, [id]);
            resolve(naissance);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const recupNaissanceByIdUtilsateur = (idUtilisateur) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `SELECT * FROM naissance WHERE idUtilisateur= ?;`;
            const naissance = yield (0, db_1._selectSql)(sql, [idUtilisateur]);
            if (!naissance.length)
                return reject({ name: "Erreur_naissance", message: "Aucune naissance trouvée" });
            resolve(naissance);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const supprimerNaissance = (idNaissance) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `DELETE FROM naissance WHERE idNaissance = ?`;
            yield (0, db_1._executeSql)(sql, [idNaissance]);
            resolve(true);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const modifierNaissance = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `UPDATE naissance SET nomCoupleNaissance=?,dateNaissance=?,lieuNaissance=?,nomEnfantNaissance=?,datePresentationNaissance=?,idUtilisateur=? WHERE idNaissance=?`;
            yield (0, db_1._executeSql)(sql, [
                data.nomCoupleNaissance,
                data.dateNaissance,
                data.lieuNaissance,
                data.nomEnfantNaissance,
                data.datePresentationNaissance,
                data.idUtilisateur,
                data.idNaissance,
            ]);
            resolve(true);
        }
        catch (error) {
            reject(error);
        }
    }));
};
exports.default = {
    recupNaissance,
    ajouterNaissance,
    supprimerNaissance,
    modifierNaissance,
    recupNaissanceId,
    recupNaissanceByIdUtilsateur
};
//# sourceMappingURL=functions.js.map