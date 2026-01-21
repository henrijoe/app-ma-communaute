import { _executeSql, _selectSql } from "../../db";
import { IMariage,} from "./interfaces";

//   
const ajouterMariage = (data: IMariage) => {
    const values = [
        data.nomFrereMariage,
        data.nomSoeurMariage,
        data.dateMariage,
        data.lieuMariage,
        data.culteMariage,
        data.temoin1Mariage,
        data.temoin2Mariage,
        data.lieuReception,
        data.contactMariage,
        data.idUtilisateur
    ]
    return new Promise(async (resolve, reject) => {
        try {
            const sqlCheck = `SELECT COUNT(*) as count FROM mariage WHERE nomSoeurMariage = ?`;
            const [result] = await _selectSql(sqlCheck, [data.nomSoeurMariage]);

            if (result.count > 0) {
                // Si les libellés existent déjà, rejeter avec un message approprié
                return reject(new Error('Ce mariage existe déjà.'));
              }
            const sql = `INSERT INTO mariage(nomFrereMariage,nomSoeurMariage,dateMariage,lieuMariage,culteMariage,temoin1Mariage,temoin2Mariage,lieuReception,contactMariage,idUtilisateur) VALUES (?,?,?,?,?,?,?,?,?,?)`;
            const mariageData: any = await _executeSql(sql, [...values]);
            resolve(mariageData.insertId)
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * recupererer toute les mariages
 * @returns 
 */
const recupMariage = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const sql = `SELECT * FROM mariage ORDER BY idMariage ASC ;`
            const mariage = await _selectSql(sql, []);
            resolve(mariage)
        } catch (error) {
            reject(error);
        }
    });
};
// Fetcher une seule mariage
const recupMariageId = (id: number) => {
    return new Promise(async (resolve, reject) => {
        try {
            const sql = `SELECT * FROM mariage WHERE idMariage =? ;`
            const mariage = await _selectSql(sql, [id]);
            resolve(mariage)
        } catch (error) {
            reject(error);
        }
    });
};

const recupMariageByIdUtilsateur = (idUtilisateur: number) => {
    return new Promise(async (resolve, reject) => {
        try {
            const sql = `SELECT * FROM mariage WHERE idUtilisateur= ?;`
            const mariage = await _selectSql(sql, [idUtilisateur]);
            if (!mariage.length) return reject({ name: "Erreur_mariage", message: "Aucun mariage trouvé" })
            resolve(mariage)
        } catch (error) {
            reject(error);
        }
    });
};

const supprimerMariage = (idMariage: number): Promise<boolean> => {
    return new Promise(async (resolve, reject) => {
        try {
            const sql = `DELETE FROM mariage WHERE idMariage = ?`;
            await _executeSql(sql, [idMariage])
            resolve(true)
        } catch (error) {
            reject(error)
        }
    });
};

const modifierMariage = (data: IMariage): Promise<boolean> => {
    return new Promise(async (resolve, reject) => {
        try {
            const sql = `UPDATE mariage SET nomFrereMariage=?,nomSoeurMariage=?,dateMariage=?,lieuMariage=?,culteMariage=?,temoin1Mariage=?,temoin2Mariage=?,lieuReception=?,contactMariage=?,idUtilisateur=? WHERE idMariage=?`
            await _executeSql(sql, [
                data.nomFrereMariage,
                data.nomSoeurMariage,
                data.dateMariage,
                data.lieuMariage,
                data.culteMariage,
                data.temoin1Mariage,
                data.temoin2Mariage,
                data.lieuReception,
                data.contactMariage,
                data.idUtilisateur,        
                data.idMariage,
            ])
            resolve(true)
        } catch (error) {
            reject(error)
        }
    })
}


export default {
    recupMariage,
    ajouterMariage,
    supprimerMariage,
    modifierMariage,
    recupMariageId,
    recupMariageByIdUtilsateur
}
