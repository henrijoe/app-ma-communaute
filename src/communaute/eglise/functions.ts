import { _executeSql, _selectSql } from "../../db";
import { IEglise} from "./interfaces";

//   
const ajouterEglise = (data: IEglise) => {

    const values = [
        data.nomEglise,
        data.idComptabilite,
        data.idUtilisateur
    ]
    return new Promise(async (resolve, reject) => {
        try {
            const sql = `INSERT INTO eglise(nomEglise,idComptabilite,idUtilisateur) VALUES (?,?,?)`;
            const egliseData: any = await _executeSql(sql, [...values]);
            resolve(egliseData.insertId)
        } catch (error) {
            reject(error);
        }
    });
};


/**
 * recupererer toute les eglises
 * @returns 
 */
const recupEglise = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const sql = `SELECT * FROM eglise ORDER BY idEglise ASC ;`
            const eglise = await _selectSql(sql, []);
            resolve(eglise)
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * recupererer toute les eglises
 * @returns 
 */
const recupEgliseById = (id:number) => {
    return new Promise(async (resolve, reject) => {
        try {
            const sql = `SELECT * FROM eglise WHERE idEglise =? ;`
            const eglise = await _selectSql(sql, [id]);
            resolve(eglise)
        } catch (error) {
            reject(error);
        }
    });
};

const supprimerEglise = (idEglise: number): Promise<boolean> => {
    return new Promise(async(resolve, reject) => {
      try {
         const sql = `DELETE FROM eglise WHERE idEglise = ?`;
          await _executeSql(sql, [idEglise])
          resolve(true);
      } catch (error) {
        reject(error);
      }         
    });
  };
  
const modifierEglise = (data: IEglise): Promise<boolean> => {
    return new Promise(async (resolve, reject) => {
      try {
        const sql = `UPDATE eglise SET nomEglise=?,idComptabilite=? WHERE idEglise=?`
        await _executeSql(sql, [
            data.nomEglise,
            data.idComptabilite,
            data.idEglise,
            ])
        resolve(true)
      } catch (error) {
        reject(error)
      }
    })
  }
  
export default {
    recupEglise,
    ajouterEglise,
    supprimerEglise,
    modifierEglise,
    recupEgliseById
}
