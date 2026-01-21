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
const ajouterGroupe = (data) => {
    const values = [
        data.libelleGroupe,
        data.descriptionGroupe,
        data.responsableGroupe,
        data.idUtilisateur
    ];
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Vérification de l'existence des libellés
            const sqlCheck = `SELECT COUNT(*) as count FROM groupe WHERE libelleGroupe = ?`;
            const [result] = yield (0, db_1._selectSql)(sqlCheck, [data.libelleGroupe]);
            if (result.count > 0) {
                // Si les libellés existent déjà, rejeter avec un message approprié
                return reject(new Error('Ce groupe existe déjà.'));
            }
            // Si les libellés n'existent pas, insérer le nouveau département
            const sql = `INSERT INTO groupe(libelleGroupe,descriptionGroupe,responsableGroupe,idUtilisateur) VALUES (?,?,?,?)`;
            const groupeData = yield (0, db_1._executeSql)(sql, [...values]);
            resolve(groupeData.insertId);
        }
        catch (error) {
            reject(error);
        }
    }));
};
/**
 * recupererer toute les groupes
 * @returns
 */
const recupGroupe = () => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `SELECT * FROM groupe ORDER BY idGroupe ASC ;`;
            const groupe = yield (0, db_1._selectSql)(sql, []);
            resolve(groupe);
        }
        catch (error) {
            reject(error);
        }
    }));
};
// Fetcher une seule groupe
const recupGroupeId = (id) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `SELECT * FROM groupe WHERE idGroupe =? ;`;
            const groupe = yield (0, db_1._selectSql)(sql, [id]);
            resolve(groupe);
        }
        catch (error) {
            reject(error);
        }
    }));
};
// const recupGroupeByIdUtilsateur = (idUtilisateur: number) => {
//     return new Promise(async (resolve, reject) => {
//         try {
//             const sql = `SELECT * FROM groupe WHERE idUtilisateur= ?;`
//             const groupes = await _selectSql(sql, [idUtilisateur]);
//             if (!groupes.length) return reject({ name: "Erreur_groupe", message: "Aucun groupe trouvé" })
//             resolve(groupes)
//         } catch (error) {
//             reject(error);
//         }
//     });
// };
const recupGroupeByIdUtilsateur = (idUtilisateur) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `SELECT * FROM groupe WHERE idUtilisateur= ?;`;
            const groupes = yield (0, db_1._selectSql)(sql, [idUtilisateur]);
            if (groupes.length === 0) {
                return reject({ name: "Erreur_groupe", message: "Aucun groupe trouvé" });
            }
            resolve(groupes);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const supprimerGroupe = (idGroupe) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `DELETE FROM groupe WHERE idGroupe = ?`;
            yield (0, db_1._executeSql)(sql, [idGroupe]);
            resolve(true);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const modifierGroupe = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `UPDATE groupe SET libelleGroupe=?, descriptionGroupe=?,responsableGroupe=?,idUtilisateur=? WHERE idGroupe=?`;
            yield (0, db_1._executeSql)(sql, [
                data.libelleGroupe,
                data.descriptionGroupe,
                data.responsableGroupe,
                data.idGroupe,
                data.idUtilisateur,
            ]);
            resolve(true);
        }
        catch (error) {
            reject(error);
        }
    }));
};
exports.default = {
    recupGroupe,
    ajouterGroupe,
    supprimerGroupe,
    modifierGroupe,
    recupGroupeId,
    recupGroupeByIdUtilsateur
};
//# sourceMappingURL=functions.js.map