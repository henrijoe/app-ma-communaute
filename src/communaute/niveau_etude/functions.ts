import { _executeSql, _selectSql } from "../../db";
import { INiveau_etude } from "./interfaces";


// 
 const ajouterNiveauEtude = (data: INiveau_etude) => {
    return new Promise(async (resolve, reject) => {
        try {
            const sql = `INSERT INTO niveau_etude(libelleNiveauEtude) VALUES (?)`;
            const niveauEtude: any = await _executeSql(sql, [data.libelleNiveauEtude]);
            resolve(niveauEtude.insertId)
        } catch (error) {
            reject(error);
        }
    });
};

export const obtenirIdNiveauEtude = () => {
    return new Promise(async(resolve, reject) => {
        try {
            const sql = `SELECT * FROM niveau_etude ORDER BY idNiveauEtude ASC;`
            const niveau = await _selectSql(sql, []);
            resolve(niveau)
        }catch (error) {
            reject(error);
        }
    });
  };

 const obtenirIdNiveauEtudeById = (id:number) => {
    return new Promise(async(resolve, reject) => {
        try {
            const sql = `SELECT * FROM niveau_etude WHERE idNiveauEtude = ?;`
            const niveau = await _selectSql(sql, [id]);
            resolve(niveau)
        }catch (error) {
            reject(error);
        }
    });
  };

  const supprimerNiveau = (idNiveauEtude: number): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM niveau_etude WHERE idNiveauEtude = ?`;
      _executeSql(sql, [idNiveauEtude])
        .then(() => {
          resolve(true);
        })
        .catch((error) => {
          reject(error);
        });
    });
  };

  const modifierNiveau = (data: INiveau_etude): Promise<boolean> => {
    return new Promise(async (resolve, reject) => {
      try {
        const sql = `UPDATE niveau_etude SET libelleNiveauEtude=? WHERE idNiveauEtude=?`
        await _executeSql(sql, [
            data.libelleNiveauEtude, 
            data.idNiveauEtude, 
            ])
        resolve(true)
      } catch (error) {
        reject(error)
      }
    })
  }


export default {
    ajouterNiveauEtude,
    obtenirIdNiveauEtude,
    supprimerNiveau,
    modifierNiveau,
    obtenirIdNiveauEtudeById
}
