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
const ajouterCellule = (data) => {
    const values = [
        data.nomCellule,
        data.lieuCellule,
        data.nombreMembreCellule,
        data.responsableCellule,
        data.responsableVisiteCellule,
        data.idUtilisateur
    ];
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sqlCheck = `SELECT COUNT(*) as count FROM cellule WHERE nomCellule = ?`;
            const [result] = yield (0, db_1._selectSql)(sqlCheck, [data.nomCellule]);
            if (result.count > 0) {
                // Si les libellés existent déjà, rejeter avec un message approprié
                return reject(new Error('Cette cellule existe déjà.'));
            }
            const sql = `INSERT INTO cellule(nomCellule,lieuCellule,nombreMembreCellule,responsableCellule,responsableVisiteCellule,idUtilisateur) VALUES (?,?,?,?,?,?)`;
            const celluleData = yield (0, db_1._executeSql)(sql, [...values]);
            resolve(celluleData.insertId);
        }
        catch (error) {
            reject(error);
        }
    }));
};
/**
 * recupererer toute les cellules
 * @returns
 */
const recupCellule = () => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `SELECT * FROM cellule ORDER BY idCellule ASC ;`;
            const cellule = yield (0, db_1._selectSql)(sql, []);
            resolve(cellule);
        }
        catch (error) {
            reject(error);
        }
    }));
};
// Fetcher une seule cellule
const recupCelluleId = (id) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `SELECT * FROM cellule WHERE idCellule =? ;`;
            const cellule = yield (0, db_1._selectSql)(sql, [id]);
            resolve(cellule);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const recupCelluleByIdUtilsateur = (idUtilisateur) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `SELECT * FROM cellule WHERE idUtilisateur= ?;`;
            const cellule = yield (0, db_1._selectSql)(sql, [idUtilisateur]);
            if (!cellule.length)
                return reject({ name: "Erreur_cellule", message: "Aucune cellule trouvée" });
            resolve(cellule);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const supprimerCellule = (idCellule) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `DELETE FROM cellule WHERE idCellule = ?`;
            yield (0, db_1._executeSql)(sql, [idCellule]);
            resolve(true);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const modifierCellule = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `UPDATE cellule SET nomCellule=?,lieuCellule=?,nombreMembreCellule=?,responsableCellule=?,responsableVisiteCellule=?,idUtilisateur=? WHERE idCellule=?`;
            yield (0, db_1._executeSql)(sql, [
                data.nomCellule,
                data.lieuCellule,
                data.nombreMembreCellule,
                data.responsableCellule,
                data.responsableVisiteCellule,
                data.idUtilisateur,
                data.idCellule,
            ]);
            resolve(true);
        }
        catch (error) {
            reject(error);
        }
    }));
};
exports.default = {
    recupCellule,
    ajouterCellule,
    supprimerCellule,
    modifierCellule,
    recupCelluleId,
    recupCelluleByIdUtilsateur
};
//# sourceMappingURL=functions.js.map