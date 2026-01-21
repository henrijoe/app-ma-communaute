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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.modifierMotDePasse = void 0;
const db_1 = require("../../db");
const functions_1 = __importDefault(require("./functions"));
// import generatePassword from "password-generator";
const path = require('path');
const fs = require("fs");
const bcrypt = require('bcrypt');
/**
 *
Permet d'ajouter un utilisateur
 * @returns
 */
const ajouterUtilisateur = (data) => {
    console.log("🚀 ~ file: services.ts:13 ~ ajouterUtilisateur ~ data:", data);
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const idUtilisateur = yield functions_1.default.ajouterUtilisateur(Object.assign({}, data));
            const utilisateur = yield functions_1.default.recupUtilisateurById(idUtilisateur);
            resolve(utilisateur);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const recupUtilisateur = () => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const utilisateur = yield functions_1.default.recupUtilisateur();
            resolve(utilisateur);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const supprimerUtilisateur = (idUtilisateur) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const utilisateur = yield functions_1.default.recupUtilisateur();
            if (Array.isArray(utilisateur)) {
                const index = utilisateur.findIndex((item) => item.idUtilisateur === idUtilisateur);
                if (index >= 0) {
                    utilisateur.splice(index, 1);
                    yield functions_1.default.supprimerUtilisateur(idUtilisateur);
                    resolve(true);
                }
                else {
                    return reject('utilisateur non trouvé');
                }
            }
        }
        catch (error) {
            reject(error);
        }
    }));
};
const modifierUtilisateur = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield functions_1.default.modifierUtilisateur(data);
            resolve(data);
        }
        catch (error) {
            reject(error);
        }
    }));
};
// Old fonction 
//   const connexionUtilisateur = (nomUtilisateur: string, motDePasse: string) => {
//     return new Promise(async (resolve, reject) => {
//       try {
//         // Récupérer l'utilisateur par son nom d'utilisateur depuis la base de données
//         const utilisateur = await _selectSql(`SELECT * FROM utilisateur WHERE nomUtilisateur = ?`, [nomUtilisateur]);
//         // Vérifier si l'utilisateur existe et si le mot de passe est valide
//         if (utilisateur && utilisateur.length > 0) {
//           const isValidPassword = await bcrypt.compare(motDePasse, utilisateur[0].password);
//           if (isValidPassword) {
//             resolve(utilisateur[0]); // Renvoyer l'utilisateur s'il est authentifié avec succès
//           } else {
//             reject('Mot de passe incorrect'); // Renvoyer une erreur si le mot de passe est incorrect
//           }
//         } else {
//           reject('Utilisateur non trouvé'); // Renvoyer une erreur si l'utilisateur n'est pas trouvé
//         }
//       } catch (error) {
//         reject(error); // Renvoyer une erreur en cas d'échec de la requête SQL
//       }
//     });
//   };
// // 
// const connexionUtilisateur = async (nomUtilisateur: string, motDePasse: string) => {
//   try {
//       // Utilisez des paramètres sécurisés dans la requête SQL
//       const utilisateur = await _selectSql(`SELECT * FROM utilisateur WHERE nomUtilisateur = ?`, [nomUtilisateur]);
//       // Gérez le cas où l'utilisateur n'est pas trouvé
//       if (!utilisateur || utilisateur.length === 0) {
//           throw new Error('Utilisateur non trouvé');
//       }
//       // Vérifiez le mot de passe en utilisant bcrypt.compare
//       const isValidPassword = await bcrypt.compare(motDePasse, utilisateur[0].password);
//       console.log("🚀 ~ connexionUtilisateur ~ isValidPassword:", isValidPassword)
//       // Renvoyez l'utilisateur s'il est authentifié avec succès
//       if (isValidPassword) {
//           return utilisateur[0];
//       } else {
//           throw new Error('Mot de passe incorrect');
//       }
//   } catch (error) {
//       // Gérez les erreurs et renvoyez des messages d'erreur appropriés
//       throw new Error(`Erreur lors de la connexion de l'utilisateur : ${error.message}`);
//   }
// };
const connexionUtilisateur = (nomUtilisateur, motDePasse) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Utilisez des paramètres sécurisés dans la requête SQL
        const utilisateur = yield (0, db_1._selectSql)(`SELECT * FROM utilisateur WHERE nomUtilisateur = ?`, [nomUtilisateur]);
        // console.log("🚀 ~ connexionUtilisateur ~ utilisateur+++++:", utilisateur)
        // Gérez le cas où l'utilisateur n'est pas trouvé
        if (!utilisateur || utilisateur.length === 0) {
            throw new Error('Utilisateur non trouvé');
        }
        // Vérifiez le mot de passe en utilisant bcrypt.compare
        const isValidPassword = yield bcrypt.compare(motDePasse, utilisateur[0].password);
        console.log("🚀 ~ connexionUtilisateur ~ isValidPassword-----:", isValidPassword);
        // Renvoyez l'utilisateur s'il est authentifié avec succès
        if (!isValidPassword) {
            return utilisateur[0];
        }
        else {
            throw new Error('Mot de passe incorrect');
        }
    }
    catch (error) {
        // Gérez les erreurs et renvoyez des messages d'erreur appropriés
        throw new Error(`Erreur lors de la connexion de l'utilisateur : ${error.message}`);
    }
});
const login = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const utilisateur = yield functions_1.default.login(data);
            // const personnel = await functions.recupUtilisateurById(utilisateur.idUtilisateur)
            const res = Object.assign({}, utilisateur);
            // console.log("🚀 ~ returnnewPromise ~ res:", res)
            resolve(res);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const modifierMotDePasse = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // console.log("🚀 ~ file: services.ts:93 ~ data", data.idUtilisateur)
            const utilisateur = yield functions_1.default.recupUtilisateurById(data.idUtilisateur);
            // console.log("🚀 ~ file: services.ts:108 ~ returnnewPromise ~ utilisateur", utilisateur)
            if (!utilisateur) {
                return reject({ message: "Une erreur s'est produite" });
            }
            // const mdpInitial = generatePassword(6, false);
            // const mdp = bcrypt.hashSync(mdpInitial.trim(), 12);
            const res = yield functions_1.default.modifierLogin(data.idUtilisateur, data.nomUtilisateur, data.confirmPassword);
            // console.log("🚀 ~ file: services.ts:117 ~ returnnewPromise ~ res", res)
            if (res) {
                const resultat = yield functions_1.default.recupUtilisateurById(data.idUtilisateur);
                resolve(resultat[0]);
            }
        }
        catch (error) {
            reject(error);
        }
    }));
};
exports.modifierMotDePasse = modifierMotDePasse;
exports.default = {
    ajouterUtilisateur,
    recupUtilisateur,
    supprimerUtilisateur,
    modifierUtilisateur,
    connexionUtilisateur,
    login,
    modifierMotDePasse: exports.modifierMotDePasse
};
//# sourceMappingURL=services.js.map