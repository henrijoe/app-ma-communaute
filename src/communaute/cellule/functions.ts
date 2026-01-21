import { _executeSql, _selectSql } from "../../db";
import { ICellule,} from "./interfaces";

//   
const ajouterCellule = (data: ICellule) => {
    const values = [
        data.nomCellule,
        data.lieuCellule,
        data.nombreMembreCellule,
        data.responsableCellule,
        data.responsableVisiteCellule,
        data.idUtilisateur
    ]
    return new Promise(async (resolve, reject) => {
        try {
            const sqlCheck = `SELECT COUNT(*) as count FROM cellule WHERE nomCellule = ?`;
            const [result] = await _selectSql(sqlCheck, [data.nomCellule]);

            if (result.count > 0) {
                // Si les libellés existent déjà, rejeter avec un message approprié
                return reject(new Error('Cette cellule existe déjà.'));
              }
            const sql = `INSERT INTO cellule(nomCellule,lieuCellule,nombreMembreCellule,responsableCellule,responsableVisiteCellule,idUtilisateur) VALUES (?,?,?,?,?,?)`;
            const celluleData: any = await _executeSql(sql, [...values]);
            resolve(celluleData.insertId)
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * recupererer toute les cellules
 * @returns 
 */
const recupCellule = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const sql = `SELECT * FROM cellule ORDER BY idCellule ASC ;`
            const cellule = await _selectSql(sql, []);
            resolve(cellule)
        } catch (error) {
            reject(error);
        }
    });
};
// Fetcher une seule cellule
const recupCelluleId = (id: number) => {
    return new Promise(async (resolve, reject) => {
        try {
            const sql = `SELECT * FROM cellule WHERE idCellule =? ;`
            const cellule = await _selectSql(sql, [id]);
            resolve(cellule)
        } catch (error) {
            reject(error);
        }
    });
};

const recupCelluleByIdUtilsateur = (idUtilisateur: number) => {
    return new Promise(async (resolve, reject) => {
        try {
            const sql = `SELECT * FROM cellule WHERE idUtilisateur= ?;`
            const cellule = await _selectSql(sql, [idUtilisateur]);
            if (!cellule.length) return reject({ name: "Erreur_cellule", message: "Aucune cellule trouvée" })
            resolve(cellule)
        } catch (error) {
            reject(error);
        }
    });
};


const supprimerCellule = (idCellule: number): Promise<boolean> => {
    return new Promise(async (resolve, reject) => {
        try {
            const sql = `DELETE FROM cellule WHERE idCellule = ?`;
            await _executeSql(sql, [idCellule])
            resolve(true)
        } catch (error) {
            reject(error)
        }
    });
};

const modifierCellule = (data: ICellule): Promise<boolean> => {
    return new Promise(async (resolve, reject) => {
        try {
            const sql = `UPDATE cellule SET nomCellule=?,lieuCellule=?,nombreMembreCellule=?,responsableCellule=?,responsableVisiteCellule=?,idUtilisateur=? WHERE idCellule=?`
            await _executeSql(sql, [
                data.nomCellule,
                data.lieuCellule,
                data.nombreMembreCellule,
                data.responsableCellule,
                data.responsableVisiteCellule,
                data.idUtilisateur,
                data.idCellule,
            ])
            resolve(true)
        } catch (error) {
            reject(error)
        }
    })
}

export default {
    recupCellule,
    ajouterCellule,
    supprimerCellule,
    modifierCellule,
    recupCelluleId,
    recupCelluleByIdUtilsateur
}
