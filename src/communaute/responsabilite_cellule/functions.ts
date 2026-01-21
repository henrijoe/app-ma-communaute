import { _executeSql, _selectSql } from "../../db";
import {  IResponsables} from "./interfaces";


//   
const ajouterResponsabilite = (data: IResponsables) => {
    const values = [
        data.idMembre,
        data.idResponsabilite,
        data.idCellule,
        data.idUtilisateur
          ]
    return new Promise(async (resolve, reject) => {
        try {
            const sql = `INSERT INTO responsable_cellule(idMembre,idResponsabilite,idCellule,idUtilisateur) VALUES (?,?,?,?)`;
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
            const sql = `SELECT * FROM responsable_cellule ORDER BY idMembre ASC ;`
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
            const sql = `SELECT * FROM responsable_cellule WHERE idMembre =? ;`
            const responsabilite = await _selectSql(sql, [id]);
            resolve(responsabilite)
        } catch (error) {
            reject(error);
        }
    });
};

const supprimerResponsabilite = (id: number): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM responsable_cellule WHERE idMembre = ?`;
      _executeSql(sql, [id])
        .then(() => {
          resolve(true);
        })
        .catch((error) => {
          reject(error);
        });
    });
  };
  
const modifierResponsabilite = (data: IResponsables): Promise<boolean> => {
    return new Promise(async (resolve, reject) => {
      try {
        const sql = `UPDATE responsable_cellule SET idMembre=?, idResponsabilite=?,idCellule=?,idUtilisateur=? WHERE idMembre=?`
        await _executeSql(sql, [
          data.idMembre,
          data.idResponsabilite,
          data.idCellule,
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
