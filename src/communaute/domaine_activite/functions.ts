import { _executeSql, _selectSql } from "../../db";
import { IDomaine_activite } from "./interfaces";


// 
const ajouterDomaineActivite = (data: IDomaine_activite) => {
    return new Promise(async (resolve, reject) => {
        try {
            const sql = `INSERT INTO domaine_activite(libelleDomaineActivite) VALUES (?)`;
            const domaineActivite: any = await _executeSql(sql, [data.libelleDomaineActivite]);
            resolve(domaineActivite.insertId)
        } catch (error) {
            reject(error);
        }
    });
};

export const obtenirDomaineActivite = () => {
    return new Promise(async(resolve, reject) => {
        try {
            const sql = `SELECT * FROM domaine_activite ORDER BY idDomaineActivite ASC`
            const domaine_activite = await _selectSql(sql, []);
            resolve(domaine_activite)
        }catch (error) {
            reject(error);
        }
    });
  };

export const obtenirDomaineActiviteById = (id:number) => {
    return new Promise(async(resolve, reject) => {
        try {
            const sql = `SELECT * FROM domaine_activite WHERE idDomaineActivite = ?`
            const domaine_activite = await _selectSql(sql, [id]);
            resolve(domaine_activite)
        }catch (error) {
            reject(error);
        }
    });
  };

  const supprimerDomaineActivite = (idDomaineActivite: number): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM domaine_activite WHERE idDomaineActivite = ?`;
      _executeSql(sql, [idDomaineActivite])
        .then(() => {
          resolve(true);
        })
        .catch((error) => {
          reject(error);
        });
    });
  };

  const modifierDomaineActivite = (data: IDomaine_activite): Promise<boolean> => {
    return new Promise(async (resolve, reject) => {
      try {
        const sql = `UPDATE domaine_activite SET libelleDomaineActivite=? WHERE idDomaineActivite=?`
        await _executeSql(sql, [
            data.libelleDomaineActivite, 
            data.idDomaineActivite, 
            ])
        resolve(true)
      } catch (error) {
        reject(error)
      }
    })
  }


export default {
    ajouterDomaineActivite,
    obtenirDomaineActivite,
    supprimerDomaineActivite,
    modifierDomaineActivite,
    obtenirDomaineActiviteById
}
