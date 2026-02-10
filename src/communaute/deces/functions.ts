import { _executeSql, _selectSql } from "../../db";
import { IDeces,} from "./interfaces";

//   
const ajouterDeces = (data: IDeces) => {
    // console.log("🚀 ~ ajouterDeces ~ data:", data)
    const values = [
        data.nomMembreDeces,
        data.dateDeces,
        data.lieuDeces,
        data.causeDeces,
        data.idUtilisateur
    ]
    return new Promise(async (resolve, reject) => {
        try {
            const sqlCheck = `SELECT COUNT(*) as count FROM deces WHERE nomMembreDeces = ?`;
            const [result] = await _selectSql(sqlCheck, [data.nomMembreDeces]);

            if (result.count > 0) {
                // Si les libellés existent déjà, rejeter avec un message approprié
                return reject(new Error('Cette deces existe déjà.'));
              }
            const sql = `INSERT INTO deces(nomMembreDeces,dateDeces,lieuDeces,causeDeces,idUtilisateur) VALUES (?,?,?,?,?)`;
            const decesData: any = await _executeSql(sql, [...values]);
            resolve(decesData.insertId)
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * recupererer tout les decess
 * @returns 
 */
const recupDeces = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const sql = `SELECT * FROM deces ORDER BY idDeces ASC ;`
            const deces = await _selectSql(sql, []);
            resolve(deces)
        } catch (error) {
            reject(error);
        }
    });
};

// Fetcher un seul deces
const recupDecesId = (id: number) => {
    return new Promise(async (resolve, reject) => {
        try {
            const sql = `SELECT * FROM deces WHERE idDeces =? ;`
            const deces = await _selectSql(sql, [id]);
            resolve(deces)
        } catch (error) {
            reject(error);
        }
    });
};

const recupDecesByIdUtilsateur = (idUtilisateur: number) => {
    return new Promise(async (resolve, reject) => {
        try {
            const sql = `SELECT * FROM deces WHERE idUtilisateur= ?;`
            const deces = await _selectSql(sql, [idUtilisateur]);
            if (!deces.length) return reject({ name: "Erreur_deces", message: "Aucun deces trouvé" })
            resolve(deces)
        } catch (error) {
            reject(error);
        }
    });
};


const supprimerDeces = (idDeces: number): Promise<boolean> => {
    return new Promise(async (resolve, reject) => {
        try {
            const sql = `DELETE FROM deces WHERE idDeces = ?`;
            await _executeSql(sql, [idDeces])
            resolve(true)
        } catch (error) {
            reject(error)
        }
    });
};

const modifierDeces = (data: IDeces): Promise<boolean> => {
    return new Promise(async (resolve, reject) => {
        try {
            const sql = `UPDATE deces SET nomMembreDeces=?,dateDeces=?,lieuDeces=?,causeDeces=?,idUtilisateur=? WHERE idDeces=?`
            await _executeSql(sql, [
                data.nomMembreDeces,
                data.dateDeces,
                data.lieuDeces,
                data.causeDeces,
                data.idUtilisateur,
                data.idDeces,
            ])
            resolve(true)
        } catch (error) {
            reject(error)
        }
    })
}


export default {
    recupDeces,
    ajouterDeces,
    supprimerDeces,
    modifierDeces,
    recupDecesId,
    recupDecesByIdUtilsateur
}
