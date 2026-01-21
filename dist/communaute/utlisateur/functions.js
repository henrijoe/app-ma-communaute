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
exports.modifierLogin = void 0;
const db_1 = require("../../db");
const bcrypt = require('bcrypt');
//   
const ajouterUtilisateur = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        // Hachage du mot de passe
        const hashedPassword = yield bcrypt.hash(data.password, 20);
        const hashedconfirmPassword = yield bcrypt.hash(data.confirmPassword, 20);
        try {
            const values = [
                data.logoUtilisateur,
                data.nomTemple,
                data.nomUtilisateur,
                data.prenomUtilisateur,
                data.telephoneUtilisateur,
                data.password,
                hashedconfirmPassword,
                data.email
            ];
            const sql = `INSERT INTO utilisateur(logoUtilisateur,nomTemple,nomUtilisateur,prenomUtilisateur,telephoneUtilisateur,password,confirmPassword,email) VALUES (?,?,?,?,?,?,?,?)`;
            // const sql = `INSERT INTO utilisateur SET ?`;
            const departement = yield (0, db_1._executeSql)(sql, [...values]);
            resolve(departement.insertId);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const recupUtilisateur = () => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `SELECT * FROM utilisateur ORDER BY idUtilisateur ASC ;`;
            const urilisateur = yield (0, db_1._selectSql)(sql, []);
            resolve(urilisateur);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const recupUtilisateurById = (id) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `SELECT * FROM utilisateur WHERE idUtilisateur = ?;`;
            const urilisateur = yield (0, db_1._selectSql)(sql, [id]);
            resolve(urilisateur);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const supprimerUtilisateur = (idUtilisateur) => {
    return new Promise((resolve, reject) => {
        const sql = `DELETE FROM utilisateur WHERE idUtilisateur = ?`;
        (0, db_1._executeSql)(sql, [idUtilisateur])
            .then(() => {
            resolve(true);
        })
            .catch((error) => {
            reject(error);
        });
    });
};
const modifierUtilisateur = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `UPDATE utilisateur SET logoUtilisateur=?,nomTemple=?, nomUtilisateur=?,prenomUtilisateur=?,telephoneUtilisateur=?,password=?,confirmPassword=?,email=? WHERE idUtilisateur=?`;
            yield (0, db_1._executeSql)(sql, [
                data.logoUtilisateur,
                data.nomTemple,
                data.nomUtilisateur,
                data.prenomUtilisateur,
                data.telephoneUtilisateur,
                data.password,
                data.confirmPassword,
                data.email,
                data.idUtilisateur
            ]);
            resolve(true);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const login = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { nomUtilisateur, password } = data;
            // console.log("🚀 ~ file: functions.ts:142 ~ returnnewPromise ~ data.body", data.body)
            const sql = `SELECT * FROM utilisateur  WHERE nomUtilisateur=? AND password=?`;
            const x = yield (0, db_1._selectSql)(sql, [nomUtilisateur, password]);
            // console.log("🚀 ~ returnnewPromise ~ x:", x)
            if (!x || x.length === 0) {
                throw new Error('Nom Utilisateur ou Mot de passe incorrect !.');
            }
            if (x.length !== 1) {
                reject({ message: "identifiant incorrect" });
            }
            else {
                console.log("🚀 ~ returnnewPromise ~ x[0]:", x[0]);
                resolve(x[0]);
            }
            // resolve(x[0]);
        }
        catch (err) {
            console.log("err:", err);
            reject(err);
        }
    }));
};
/**
 * Mettre à jour le mot de passe d'un utilisateur
 * @param data
 */
const modifierLogin = (idUtilisateur, password, confirmPassword) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            //mise a jour du mot de passe
            const sql = `UPDATE utilisateur
                       SET password=?,
                       confirmPassword=?
                       WHERE idUtilisateur=?`;
            yield (0, db_1._executeSql)(sql, [password, confirmPassword, idUtilisateur]);
            resolve(true);
        }
        catch (error) {
            reject(error);
        }
    }));
};
exports.modifierLogin = modifierLogin;
exports.default = {
    ajouterUtilisateur,
    recupUtilisateur,
    supprimerUtilisateur,
    modifierUtilisateur,
    recupUtilisateurById,
    login,
    modifierLogin: exports.modifierLogin
};
//# sourceMappingURL=functions.js.map