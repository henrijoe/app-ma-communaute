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
const ajouterDeces = (data) => {
    console.log("🚀 ~ ajouterDeces ~ data:", data);
    const values = [
        data.nomMembreDeces,
        data.dateDeces,
        data.lieuDeces,
        data.causeDeces,
        data.idUtilisateur
    ];
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sqlCheck = `SELECT COUNT(*) as count FROM deces WHERE nomMembreDeces = ?`;
            const [result] = yield (0, db_1._selectSql)(sqlCheck, [data.nomMembreDeces]);
            if (result.count > 0) {
                // Si les libellés existent déjà, rejeter avec un message approprié
                return reject(new Error('Cette deces existe déjà.'));
            }
            const sql = `INSERT INTO deces(nomMembreDeces,dateDeces,lieuDeces,causeDeces,idUtilisateur) VALUES (?,?,?,?,?)`;
            const decesData = yield (0, db_1._executeSql)(sql, [...values]);
            resolve(decesData.insertId);
        }
        catch (error) {
            reject(error);
        }
    }));
};
/**
 * recupererer tout les decess
 * @returns
 */
const recupDeces = () => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `SELECT * FROM deces ORDER BY idDeces ASC ;`;
            const deces = yield (0, db_1._selectSql)(sql, []);
            resolve(deces);
        }
        catch (error) {
            reject(error);
        }
    }));
};
// Fetcher un seul deces
const recupDecesId = (id) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `SELECT * FROM deces WHERE idDeces =? ;`;
            const deces = yield (0, db_1._selectSql)(sql, [id]);
            resolve(deces);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const recupDecesByIdUtilsateur = (idUtilisateur) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `SELECT * FROM deces WHERE idUtilisateur= ?;`;
            const deces = yield (0, db_1._selectSql)(sql, [idUtilisateur]);
            if (!deces.length)
                return reject({ name: "Erreur_deces", message: "Aucun deces trouvé" });
            resolve(deces);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const supprimerDeces = (idDeces) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `DELETE FROM deces WHERE idDeces = ?`;
            yield (0, db_1._executeSql)(sql, [idDeces]);
            resolve(true);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const modifierDeces = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `UPDATE deces SET nomMembreDeces=?,dateDeces=?,lieuDeces=?,causeDeces=?,idUtilisateur=? WHERE idDeces=?`;
            yield (0, db_1._executeSql)(sql, [
                data.nomMembreDeces,
                data.dateDeces,
                data.lieuDeces,
                data.causeDeces,
                data.idUtilisateur,
                data.idDeces,
            ]);
            resolve(true);
        }
        catch (error) {
            reject(error);
        }
    }));
};
exports.default = {
    recupDeces,
    ajouterDeces,
    supprimerDeces,
    modifierDeces,
    recupDecesId,
    recupDecesByIdUtilsateur
};
//# sourceMappingURL=functions.js.map