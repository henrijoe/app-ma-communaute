import { _executeSql, _selectSql } from "../../db";
import { ICulte,} from "./interfaces";

//   
const ajouterCulte = (data: ICulte) => {
    // console.log("🚀 ~ ajouterCulte ~ data:", data)
    const values = [
        data.typeCulte,
        data.dateCulte,
        data.dirigeant,
        data.predication,
        data.passageBiblique,
        data.themePredication,
        data.nombreHommeCulte,
        data.nombreFemmeCulte,
        data.offrandeCulte,
        data.ecodim,
        data.filleEcodim,
        data.offrandeEcodim,
        data.resumePredication,
        data.idUtilisateur
    ]
    return new Promise(async (resolve, reject) => {
        try {
            const sqlCheck = `SELECT COUNT(*) as count FROM culte WHERE dateCulte = ?`;
            const [result] = await _selectSql(sqlCheck, [data.dateCulte]);
            if (result.count > 0) {
                // Si les libellés existent déjà, rejeter avec un message approprié
                return reject(new Error('Ce culte existe déjà.'));
              }
            const sql = `INSERT INTO culte(typeCulte,dateCulte,dirigeant,predication,passageBiblique,themePredication,nombreHommeCulte,nombreFemmeCulte,offrandeCulte,ecodim,filleEcodim,offrandeEcodim,resumePredication,idUtilisateur) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
            const culteData: any = await _executeSql(sql, [...values]);
            resolve(culteData.insertId)
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * recupererer toute les cultes
 * @returns 
 */
const recupCulte = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const sql = `SELECT * FROM culte ORDER BY idCulte ASC ;`
            const culte = await _selectSql(sql, []);
            resolve(culte)
        } catch (error) {
            reject(error);
        }
    });
};

// Fetcher un seul culte
const recupCulteId = (id: number) => {
    return new Promise(async (resolve, reject) => {
        try {
            const sql = `SELECT * FROM culte WHERE idCulte =? ;`
            const culte = await _selectSql(sql, [id]);
            resolve(culte)
        } catch (error) {
            reject(error);
        }
    });
};

const recupCulteByIdUtilsateur = (idUtilisateur: number) => {
    return new Promise(async (resolve, reject) => {
        try {
            const sql = `SELECT * FROM culte WHERE idUtilisateur= ?;`
            const culte = await _selectSql(sql, [idUtilisateur]);
            if (!culte.length) return reject({ name: "Erreur_culte", message: "Aucun culte trouvé" })
            resolve(culte)
        } catch (error) {
            reject(error);
        }
    });
};

const supprimerCulte = (idCulte: number): Promise<boolean> => {
    return new Promise(async (resolve, reject) => {
        try {
            const sql = `DELETE FROM culte WHERE idCulte = ?`;
            await _executeSql(sql, [idCulte])
            resolve(true)
        } catch (error) {
            reject(error)
        }
    });
};

const modifierCulte = (data: ICulte): Promise<boolean> => {
    return new Promise(async (resolve, reject) => {
        try {
            const sql = `UPDATE culte SET typeCulte=?,dateCulte=?,dirigeant=?,predication=?,passageBiblique=?,themePredication=?,nombreHommeCulte=?,nombreFemmeCulte=?,offrandeCulte=?,ecodim=?,filleEcodim=?,offrandeEcodim=?,resumePredication=?,idUtilisateur=? WHERE idCulte=?`
            await _executeSql(sql, [
                data.typeCulte,
                data.dateCulte,
                data.dirigeant,
                data.predication,
                data.passageBiblique,
                data.themePredication,
                data.nombreHommeCulte,
                data.nombreFemmeCulte,
                data.offrandeCulte,
                data.ecodim,
                data.filleEcodim,
                 data.offrandeEcodim,
                data.resumePredication,
                data.idUtilisateur,
                data.idCulte,
            ])
            resolve(true)
        } catch (error) {
            reject(error)
        }
    })
}

export default {
    recupCulte,
    ajouterCulte,
    supprimerCulte,
    modifierCulte,
    recupCulteId,
    recupCulteByIdUtilsateur
}
