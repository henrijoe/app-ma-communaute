import { _executeSql, _selectSql } from "../../db";
import { IMaladie } from "./interfaces";

const ajouterMaladie = (data: IMaladie) => {
  const values = [
    data.nomMembreMaladie,
    data.typeMaladie,
    data.dateMaladie,
    data.lieuHospitalisation,
    data.observationMaladie,
    data.idUtilisateur,
  ];

  return new Promise(async (resolve, reject) => {
    try {
      const sqlCheck = `SELECT COUNT(*) as count FROM maladie WHERE nomMembreMaladie = ? AND dateMaladie = ?`;
      const [result] = await _selectSql(sqlCheck, [data.nomMembreMaladie, data.dateMaladie]);

      if (result?.count > 0) {
        return reject(new Error('Ce cas de maladie existe deja.'));
      }

      const sql = `INSERT INTO maladie(nomMembreMaladie,typeMaladie,dateMaladie,lieuHospitalisation,observationMaladie,idUtilisateur) VALUES (?,?,?,?,?,?)`;
      const maladieData: any = await _executeSql(sql, values);
      resolve(maladieData.insertId);
    } catch (error) {
      reject(error);
    }
  });
};

const recupMaladie = () => new Promise(async (resolve, reject) => {
  try {
    const sql = `SELECT * FROM maladie ORDER BY idMaladie ASC ;`;
    const maladie = await _selectSql(sql, []);
    resolve(maladie);
  } catch (error) {
    reject(error);
  }
});

const recupMaladieId = (id: number) => new Promise(async (resolve, reject) => {
  try {
    const sql = `SELECT * FROM maladie WHERE idMaladie = ? ;`;
    const maladie = await _selectSql(sql, [id]);
    resolve(maladie);
  } catch (error) {
    reject(error);
  }
});

const recupMaladieByIdUtilsateur = (idUtilisateur: number) => new Promise(async (resolve, reject) => {
  try {
    const sql = `SELECT * FROM maladie WHERE idUtilisateur = ?;`;
    const maladie = await _selectSql(sql, [idUtilisateur]);
    if (!maladie.length) return reject({ name: 'Erreur_maladie', message: 'Aucune maladie trouvee' });
    resolve(maladie);
  } catch (error) {
    reject(error);
  }
});

const supprimerMaladie = (idMaladie: number): Promise<boolean> => new Promise(async (resolve, reject) => {
  try {
    const sql = `DELETE FROM maladie WHERE idMaladie = ?`;
    await _executeSql(sql, [idMaladie]);
    resolve(true);
  } catch (error) {
    reject(error);
  }
});

const modifierMaladie = (data: IMaladie): Promise<boolean> => new Promise(async (resolve, reject) => {
  try {
    const sql = `UPDATE maladie SET nomMembreMaladie=?,typeMaladie=?,dateMaladie=?,lieuHospitalisation=?,observationMaladie=?,idUtilisateur=? WHERE idMaladie=?`;
    await _executeSql(sql, [
      data.nomMembreMaladie,
      data.typeMaladie,
      data.dateMaladie,
      data.lieuHospitalisation,
      data.observationMaladie,
      data.idUtilisateur,
      data.idMaladie,
    ]);
    resolve(true);
  } catch (error) {
    reject(error);
  }
});

export default {
  ajouterMaladie,
  recupMaladie,
  recupMaladieId,
  recupMaladieByIdUtilsateur,
  supprimerMaladie,
  modifierMaladie,
};
