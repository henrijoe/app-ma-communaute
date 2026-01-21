import { _executeSql, _selectSql } from "../../db";
import { INaissance,} from "./interfaces";

//   
const ajouterNaissance = (data: INaissance) => {
    const values = [
        data.nomCoupleNaissance,
        data.dateNaissance,
        data.lieuNaissance,
        data.nomEnfantNaissance,
        data.datePresentationNaissance,
        data.idUtilisateur
    ]
    return new Promise(async (resolve, reject) => {
        try {
            // const sqlCheck = `SELECT COUNT(*) as count FROM naissance WHERE nomNaissance = ?`;
            // const [result] = await _selectSql(sqlCheck, [data.nomNaissance]);

            // if (result.count > 0) {
            //     // Si les libellés existent déjà, rejeter avec un message approprié
            //     return reject(new Error('Cette naissance existe déjà.'));
            //   }
            const sql = `INSERT INTO naissance(nomCoupleNaissance,dateNaissance,lieuNaissance,nomEnfantNaissance,datePresentationNaissance,idUtilisateur) VALUES (?,?,?,?,?,?)`;
            const naissanceData: any = await _executeSql(sql, [...values]);
            resolve(naissanceData.insertId)
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * recupererer toute les naissances
 * @returns 
 */
const recupNaissance = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const sql = `SELECT * FROM naissance ORDER BY idNaissance ASC ;`
            const naissance = await _selectSql(sql, []);
            resolve(naissance)
        } catch (error) {
            reject(error);
        }
    });
};
// Fetcher une seule naissance
const recupNaissanceId = (id: number) => {
    return new Promise(async (resolve, reject) => {
        try {
            const sql = `SELECT * FROM naissance WHERE idNaissance =? ;`
            const naissance = await _selectSql(sql, [id]);
            resolve(naissance)
        } catch (error) {
            reject(error);
        }
    });
};

const recupNaissanceByIdUtilsateur = (idUtilisateur: number) => {
    return new Promise(async (resolve, reject) => {
        try {
            const sql = `SELECT * FROM naissance WHERE idUtilisateur= ?;`
            const naissance = await _selectSql(sql, [idUtilisateur]);
            if (!naissance.length) return reject({ name: "Erreur_naissance", message: "Aucune naissance trouvée" })
            resolve(naissance)
        } catch (error) {
            reject(error);
        }
    });
};


const supprimerNaissance = (idNaissance: number): Promise<boolean> => {
    return new Promise(async (resolve, reject) => {
        try {
            const sql = `DELETE FROM naissance WHERE idNaissance = ?`;
            await _executeSql(sql, [idNaissance])
            resolve(true)
        } catch (error) {
            reject(error)
        }
    });
};

const modifierNaissance = (data: INaissance): Promise<boolean> => {
    return new Promise(async (resolve, reject) => {
        try {
            const sql = `UPDATE naissance SET nomCoupleNaissance=?,dateNaissance=?,lieuNaissance=?,nomEnfantNaissance=?,datePresentationNaissance=?,idUtilisateur=? WHERE idNaissance=?`
            await _executeSql(sql, [
                data.nomCoupleNaissance,
                data.dateNaissance,
                data.lieuNaissance,
                data.nomEnfantNaissance,
                data.datePresentationNaissance,
                data.idUtilisateur,
                data.idNaissance,
            ])
            resolve(true)
        } catch (error) {
            reject(error)
        }
    })
}

export default {
    recupNaissance,
    ajouterNaissance,
    supprimerNaissance,
    modifierNaissance,
    recupNaissanceId,
    recupNaissanceByIdUtilsateur
}
