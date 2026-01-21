import { _executeSql, _selectSql } from "../../db";
import { IResponsable, } from "./interfaces";


//   
const ajouterResponsabilite = (data: IResponsable) => {
    const values = [
        data.libelleResponsabilite,
        data.descriptionResponsabilite,
        data.idUtilisateur
          ]
    return new Promise(async (resolve, reject) => {
        try {
            const sql = `INSERT INTO responsabilite(libelleResponsabilite,descriptionResponsabilite,idUtilisateur) VALUES (?,?,?)`;
            const responsabilite: any = await _executeSql(sql, [...values]);
            resolve(responsabilite.insertId)
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * recupererer toute les responsabilites
 * @returns 
 */
const recupResponsabilite = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const sql = `SELECT * FROM responsabilite ORDER BY idResponsabilite ASC ;`
            const responsabilite = await _selectSql(sql, []);
            resolve(responsabilite)
        } catch (error) {
            reject(error);
        }
    });
};

const recupResponsabiliteById = (id:number) => {
    return new Promise(async (resolve, reject) => {
        try {
            const sql = `SELECT * FROM responsabilite WHERE idResponsabilite = ? ;`
            const responsabilite = await _selectSql(sql, [id]);
            resolve(responsabilite)
        } catch (error) {
            reject(error);
        }
    });
};

const supprimerResponsabilite = (id: number): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM responsabilite WHERE idResponsabilite = ?`;
      _executeSql(sql, [id])
        .then(() => {
          resolve(true);
        })
        .catch((error) => {
          reject(error);
        });
    });
  };
  
const modifierResponsabilite = (data: IResponsable): Promise<boolean> => {
    return new Promise(async (resolve, reject) => {
      try {
        const sql = `UPDATE responsabilite SET libelleResponsabilite=?, descriptionResponsabilite=?,idUtilisateur=? WHERE idResponsabilite=?`
        await _executeSql(sql, [
          data.libelleResponsabilite,
          data.descriptionResponsabilite,
          data.idResponsabilite,    
          data.idUtilisateur    
            ])
        resolve(true)
      } catch (error) {
        reject(error)
      }
    })
  }
  
export default {
    ajouterResponsabilite,
    recupResponsabilite,
    supprimerResponsabilite,
    modifierResponsabilite,
    recupResponsabiliteById
}
