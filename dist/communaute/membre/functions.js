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
const functions_1 = require("../functions");
//  ajouter  
const ajouterMembre = (data) => {
    // Préparer les valeurs AVEC la photo
    const values = [
        data.nomMembre || '',
        data.prenomMembre || '',
        data.dateNaissMembre || null,
        data.lieuNaissMembre || '',
        data.sexeMembre || null,
        data.emailMembre || '',
        data.nationaliteMembre || '',
        data.fonctionMembre || '',
        data.contactMembre || '',
        data.ethnieMembre || '',
        data.residenceMembre || '',
        data.civiliteMembre || '',
        data.nouvelleAmeMembre || null,
        data.dateConversionMembre || null,
        data.baptemeEauMembre || null,
        data.dateBaptemeMembre || null,
        data.dateMariageMembre || null,
        data.capaciteSpirituelleMembre || null,
        data.situationMatrimonialeMembre || null,
        data.nomFiance || '',
        data.photoMembre || '',
        data.lieuBaptemeEauMembre || '',
        data.baptemeSaintEspritMembre || null,
        data.dateBaptemeSaintEspritMembre || null,
        data.egliseOrigineMembre || '',
        data.nomAmiEglise || '',
        data.visiteMembre || null,
        data.raisonNonVisiteMembre || '',
        data.heureVisiteMembre || '',
        data.dateDecisionMembre || null,
        data.lieuTravailMembre || '',
        data.idNiveauEtude || null,
        data.idCellule || null,
        data.idDepartement || null,
        data.idGroupe || null,
        data.idResponsabilite || null,
        data.idUtilisateur || null
    ];
    console.log("Nombre de valeurs préparées:", values.length); // Doit être 37
    console.log("Valeurs:", values);
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            let fileName = null;
            // Gestion de la photo (optionnelle - seulement si photo fournie)
            if (data.photoMembre && data.photoMembre.trim() !== '' && data.photoMembre.startsWith('data:image/')) {
                // Extraire la partie base64
                const base64Data = data.photoMembre.replace(/^data:image\/\w+;base64,/, '');
                // Générer un nom de fichier temporaire
                fileName = `temp_${Date.now()}.jpg`;
                // Sauvegarder le fichier
                const filePath = (0, functions_1.getAvatarsPath)(fileName);
                yield (0, functions_1.saveFileToBase64)(filePath, base64Data);
                // Mettre à jour la valeur dans le tableau
                values[20] = fileName; // photoMembre est à l'index 20
            }
            const sql = `INSERT INTO 
            membre(nomMembre,
                prenomMembre,
                dateNaissMembre,
                lieuNaissMembre,
                sexeMembre,
                emailMembre,
                nationaliteMembre,
                fonctionMembre,
                contactMembre,
                ethnieMembre,
                residenceMembre,
                civiliteMembre,
                nouvelleAmeMembre,
                dateConversionMembre,
                baptemeEauMembre,
                dateBaptemeMembre,
                dateMariageMembre,
                capaciteSpirituelleMembre,
                situationMatrimonialeMembre,
                nomFiance,
                photoMembre,
                lieuBaptemeEauMembre,
                baptemeSaintEspritMembre,
                dateBaptemeSaintEspritMembre,
                egliseOrigineMembre,
                nomAmiEglise,
                visiteMembre,
                raisonNonVisiteMembre,
                heureVisiteMembre,
                dateDecisionMembre,
                lieuTravailMembre,
                idNiveauEtude,
                idCellule,
                idDepartement,
                idGroupe,
                idResponsabilite,
                idUtilisateur
                ) 
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
            console.log("Requête SQL:", sql);
            console.log("Nombre de ? dans la requête:", (sql.match(/\?/g) || []).length);
            const membreInserted = yield (0, db_1._executeSql)(sql, values);
            const insertedId = membreInserted.insertId;
            // Renommage du fichier si nécessaire
            if (fileName && fileName.startsWith('temp_') && insertedId) {
                try {
                    const fs = require('fs');
                    const oldPath = (0, functions_1.getAvatarsPath)(fileName);
                    const newFileName = `membre_${insertedId}.jpg`;
                    const newPath = (0, functions_1.getAvatarsPath)(newFileName);
                    if (fs.existsSync(oldPath)) {
                        fs.renameSync(oldPath, newPath);
                        // Mettre à jour le nom de fichier dans la base
                        const updateSql = `UPDATE membre SET photoMembre = ? WHERE idMembre = ?`;
                        yield (0, db_1._executeSql)(updateSql, [newFileName, insertedId]);
                    }
                }
                catch (renameError) {
                    console.error('Erreur lors du renommage:', renameError);
                }
            }
            // Récupérer le membre créé
            const membre = yield recupMembreById(insertedId);
            resolve(membre[0]);
        }
        catch (error) {
            console.error("Erreur dans ajouterMembre:", error);
            reject(error);
        }
    }));
};
/**
 * recupererer tout les membres
 * @returns
 */
const recupMembre = () => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `SELECT * FROM membre ORDER BY idMembre ASC ;`;
            const membre = yield (0, db_1._selectSql)(sql, []);
            if (!membre.length)
                return reject({ name: "Erreur_membre", message: "Aucun membre trouvé" });
            resolve(membre);
        }
        catch (error) {
            reject(error);
        }
    }));
};
/**
 * recupererer tout les membres
 * @returns
 */
const recupMembreById = (id) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `SELECT * FROM membre WHERE idMembre= ?;`;
            const membre = yield (0, db_1._selectSql)(sql, [id]);
            if (!membre.length)
                return reject({ name: "Erreur_membre", message: "Aucun membre trouvé" });
            resolve(membre);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const recupMembreByIdUtilsateur = (idUtilisateur) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `SELECT * FROM membre WHERE idUtilisateur= ?;`;
            const membre = yield (0, db_1._selectSql)(sql, [idUtilisateur]);
            if (!membre.length)
                return reject({ name: "Erreur_membre", message: "Aucun membre trouvé" });
            resolve(membre);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const supprimerMembre = (idMembre) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `DELETE FROM membre WHERE idMembre = ?`;
            yield (0, db_1._executeSql)(sql, [idMembre]);
            resolve(true);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const modifierMembre = (data) => {
    // console.log("🚀 ~ file: functions.ts:131 ~ modifierMembre ~ data:", data)
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const sql = `UPDATE membre SET nomMembre=?,prenomMembre=?,
            dateNaissMembre=?,lieuNaissMembre=?,sexeMembre=?,emailMembre=?,
            nationaliteMembre=?,fonctionMembre=?,contactMembre=?,ethnieMembre=?, 
            residenceMembre=?,civiliteMembre=?,
            nouvelleAmeMembre=?,
            dateConversionMembre=?,baptemeEauMembre=?, 
            dateBaptemeMembre=?,dateMariageMembre=?,capaciteSpirituelleMembre=?, 
            situationMatrimonialeMembre=?,
            nomFiance=?,
            photoMembre=?, 
            lieuBaptemeEauMembre=?,
            baptemeSaintEspritMembre=?, 
            dateBaptemeSaintEspritMembre=?,
            egliseOrigineMembre=?, 
            nomAmiEglise=?,
            visiteMembre=?,
            raisonNonVisiteMembre=?,
            heureVisiteMembre=?,
            dateDecisionMembre=?,
            lieuTravailMembre=?,
            idNiveauEtude=?,
            idCellule=?, 
            idDepartement=?,idGroupe=?,idResponsabilite=?, 
            idUtilisateur=? WHERE idMembre=?`;
            yield (0, db_1._executeSql)(sql, [
                data.nomMembre,
                data.prenomMembre,
                data.dateNaissMembre,
                data.lieuNaissMembre,
                data.sexeMembre,
                data.emailMembre,
                data.nationaliteMembre,
                data.fonctionMembre,
                data.contactMembre,
                data.ethnieMembre,
                data.residenceMembre,
                data.civiliteMembre,
                data.nouvelleAmeMembre,
                data.dateConversionMembre,
                data.baptemeEauMembre,
                data.dateBaptemeMembre,
                data.dateMariageMembre,
                data.capaciteSpirituelleMembre,
                data.situationMatrimonialeMembre,
                data.nomFiance,
                data.photoMembre,
                data.lieuBaptemeEauMembre,
                data.baptemeSaintEspritMembre,
                data.dateBaptemeSaintEspritMembre,
                data.egliseOrigineMembre,
                data.nomAmiEglise,
                data.visiteMembre,
                data.raisonNonVisiteMembre,
                data.heureVisiteMembre,
                data.dateDecisionMembre,
                data.lieuTravailMembre,
                data.idNiveauEtude,
                data.idCellule,
                data.idDepartement,
                data.idGroupe,
                data.idResponsabilite,
                data.idUtilisateur,
                data.idMembre
            ]);
            resolve(true);
        }
        catch (error) {
            reject(error);
        }
    }));
};
exports.default = {
    recupMembre,
    ajouterMembre,
    supprimerMembre,
    modifierMembre,
    recupMembreById,
    recupMembreByIdUtilsateur,
};
//# sourceMappingURL=functions.js.map