import { _executeSql, _selectSql } from "../../db";
import { IMembre, } from "./interfaces";
import { getAvatarsPath, saveFileToBase64 } from "../functions";

//  ajouter  

const ajouterMembre = (data: IMembre) => {
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
        data.photoMembre || '', // ← Initialiser avec la valeur reçue
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

    return new Promise(async (resolve, reject) => {
        try {
            let fileName: string | null = null;

            // Gestion de la photo (optionnelle - seulement si photo fournie)
            if (data.photoMembre && data.photoMembre.trim() !== '' && data.photoMembre.startsWith('data:image/')) {
                // Extraire la partie base64
                const base64Data = data.photoMembre.replace(/^data:image\/\w+;base64,/, '');
                
                // Générer un nom de fichier temporaire
                fileName = `temp_${Date.now()}.jpg`;
                
                // Sauvegarder le fichier
                const filePath = getAvatarsPath(fileName);
                await saveFileToBase64(filePath, base64Data);
                
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

            const membreInserted: any = await _executeSql(sql, values);
            const insertedId = membreInserted.insertId;

            // Renommage du fichier si nécessaire
            if (fileName && fileName.startsWith('temp_') && insertedId) {
                try {
                    const fs = require('fs');
                    const oldPath = getAvatarsPath(fileName);
                    const newFileName = `membre_${insertedId}.jpg`;
                    const newPath = getAvatarsPath(newFileName);

                    if (fs.existsSync(oldPath)) {
                        fs.renameSync(oldPath, newPath);
                        
                        // Mettre à jour le nom de fichier dans la base
                        const updateSql = `UPDATE membre SET photoMembre = ? WHERE idMembre = ?`;
                        await _executeSql(updateSql, [newFileName, insertedId]);
                    }
                } catch (renameError) {
                    console.error('Erreur lors du renommage:', renameError);
                }
            }

            // Récupérer le membre créé
            const membre: any = await recupMembreById(insertedId);
            resolve(membre[0]);
        } catch (error) {
            console.error("Erreur dans ajouterMembre:", error);
            reject(error);
        }
    });
};

/**
 * recupererer tout les membres
 * @returns 
 */
const recupMembre = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const sql = `SELECT * FROM membre ORDER BY idMembre ASC ;`
            const membre = await _selectSql(sql, []);
            if (!membre.length) return reject({ name: "Erreur_membre", message: "Aucun membre trouvé" })
            resolve(membre)
        } catch (error) {
            reject(error);
        }
    });
};
/**
 * recupererer tout les membres
 * @returns 
 */
const recupMembreById = (id: number) => {
    return new Promise(async (resolve, reject) => {
        try {
            const sql = `SELECT * FROM membre WHERE idMembre= ?;`
            const membre = await _selectSql(sql, [id]);
            if (!membre.length) return reject({ name: "Erreur_membre", message: "Aucun membre trouvé" })
            resolve(membre)
        } catch (error) {
            reject(error);
        }
    });
};

const recupMembreByIdUtilsateur = (idUtilisateur: number) => {
    return new Promise(async (resolve, reject) => {
        try {
            const sql = `SELECT * FROM membre WHERE idUtilisateur= ?;`
            const membre = await _selectSql(sql, [idUtilisateur]);
            if (!membre.length) return reject({ name: "Erreur_membre", message: "Aucun membre trouvé" })
            resolve(membre)
        } catch (error) {
            reject(error);
        }
    });
};

const supprimerMembre = (idMembre: number): Promise<boolean> => {
    return new Promise(async (resolve, reject) => {
        try {
            const sql = `DELETE FROM membre WHERE idMembre = ?`;
            await _executeSql(sql, [idMembre]);
            resolve(true)
        } catch (error) {
            reject(error);
        }
    });
};

const modifierMembre = (data: IMembre): Promise<boolean> => {
    // console.log("🚀 ~ file: functions.ts:131 ~ modifierMembre ~ data:", data)
    return new Promise(async (resolve, reject) => {
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
            await _executeSql(sql, [
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
            ])
            resolve(true)
        } catch (error) {
            reject(error)
        }
    })
}

export default {
    recupMembre,
    ajouterMembre,
    supprimerMembre,
    modifierMembre,
    recupMembreById,
    recupMembreByIdUtilsateur,
}