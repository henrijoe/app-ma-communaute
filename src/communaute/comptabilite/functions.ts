import { _executeSql, _selectSql } from "../../db";
import { IComptabilite } from "./interfaces";


//   
const ajouterComptablilite = (data: IComptabilite) => {
    const values = [
        data.nomComptabilite,
        data.entreeComptabilite,
        data.sortieComptabilite,
        data.dateComptabilite,
        data.observationComptabilite,      
        data.idUtilisateur      
    ]
    return new Promise(async (resolve, reject) => {
        try {
            const sql = `INSERT INTO comptabilite(nomComptabilite,entreeComptabilite,sortieComptabilite,dateComptabilite,observationComptabilite,idUtilisateur) VALUES (?,?,?,?,?,?)`;
            const comptabilite: any = await _executeSql(sql, [...values]);
            resolve(comptabilite.insertId)
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * recupererer toute les comptabilite
 * @returns 
 */
const recupComptabilite = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const sql = `SELECT * FROM comptabilite ORDER BY idComptabilite ASC ;`
            const comptabilite = await _selectSql(sql, []);
            resolve(comptabilite)
        } catch (error) {
            reject(error);
        }
    });
};
const recupComptabiliteById = (id:number) => {
    return new Promise(async (resolve, reject) => {
        try {
            const sql = `SELECT * FROM comptabilite WHERE idComptabilite =? ;`
            const comptabilite = await _selectSql(sql, [id]);
            resolve(comptabilite)
        } catch (error) {
            reject(error);
        }
    });
};

const supprimerComptabilite = (idComptabilite: number): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM comptabilite WHERE idComptabilite = ?`;
      _executeSql(sql, [idComptabilite])
        .then(() => {
          resolve(true);
        })
        .catch((error) => {
          reject(error);
        });
    });
  };
  
const modifierComptabilite = (data: IComptabilite): Promise<boolean> => {
    return new Promise(async (resolve, reject) => {
      try {
        const sql = `UPDATE comptabilite SET nomComptabilite=?, entreeComptabilite=?,sortieComptabilite=?,dateComptabilite=?,observationComptabilite=?,observationComptabilite=?,idUtilisateur=? WHERE idComptabilite=?`
        await _executeSql(sql, [
            data.nomComptabilite,
            data.entreeComptabilite,
            data.sortieComptabilite,
            data.dateComptabilite,
            data.observationComptabilite,
            data.idComptabilite,
            data.idUtilisateur    
            ])
        resolve(true)
      } catch (error) {
        reject(error)
      }
    })
  }
  
export default {
    ajouterComptablilite,
    recupComptabilite,
    supprimerComptabilite,
    modifierComptabilite,
    recupComptabiliteById
}
