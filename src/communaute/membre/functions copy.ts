import { _executeSql, _selectSql } from "../../db";
import functions from "../niveau_etude/functions";
import { IMembre, } from "./interfaces";


//  ajouter  
const ajouterMembre = (data: IMembre) => {

    const values = [
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
        data.photoMembre,
        data.lieuBaptemeEauMembre,
        data.baptemeSaintEspritMembre,
        data.dateBaptemeSaintEspritMembre,
        data.egliseOrigineMembre,
        data.idNiveauEtude,
        data.idEglise,
        data.idCellule,
        data.idDepartement,
        data.idGroupe,
        data.idResponsabilite,
        data.idUtilisateur
    ]
    return new Promise(async (resolve, reject) => {
        try {
            let photoMembre: string = (data.photoMembre == "" ? "" : `data:image/jpeg;base64,${data.photoMembre}`);
      
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
                photoMembre,
                lieuBaptemeEauMembre,
                baptemeSaintEspritMembre,
                dateBaptemeSaintEspritMembre,
                egliseOrigineMembre,
                idNiveauEtude,
                idEglise,
                idCellule,
                idDepartement,
                idGroupe,
                idResponsabilite,
                idUtilisateur
                ) 
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
            const membreInserted: any = await _executeSql(sql, [...values]);

            resolve(membreInserted.insertId)
        } catch (error) {
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
    console.log("🚀 ~ file: functions.ts:131 ~ modifierMembre ~ data:", data)
    return new Promise(async (resolve, reject) => {
        try {
            const sql = `UPDATE membre SET nomMembre=?,prenomMembre=?,
            dateNaissMembre=?,lieuNaissMembre=?,sexeMembre=?,emailMembre=?,
            nationaliteMembre=?,fonctionMembre=?,contactMembre=?,ethnieMembre=?, 
            residenceMembre=?,civiliteMembre=?,
            nouvelleAmeMembre=?,
            dateConversionMembre=?,baptemeEauMembre=?, 
            dateBaptemeMembre=?,dateMariageMembre=?,capaciteSpirituelleMembre=?, 
            situationMatrimonialeMembre=?,photoMembre=?, 
            lieuBaptemeEauMembre=?,
            baptemeSaintEspritMembre=?, 
            dateBaptemeSaintEspritMembre=?,
            egliseOrigineMembre=?, 
            idNiveauEtude=?,idEglise=?,idCellule=?, 
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
                data.photoMembre,
                data.lieuBaptemeEauMembre,
                data.baptemeSaintEspritMembre,
                data.dateBaptemeSaintEspritMembre,
                data.egliseOrigineMembre,
                data.idNiveauEtude,
                data.idEglise,
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
}