import { _executeSql, _selectSql } from "../../db";
import { INaissance } from "./interfaces";

const ajouterNaissance = (data: INaissance) => {
  const values = [
    data.nomCoupleNaissance,
    data.dateNaissance,
    data.lieuNaissance,
    data.nomEnfantNaissance,
    data.datePresentationNaissance,
    data.idUtilisateur,
  ];

  return new Promise(async (resolve, reject) => {
    try {
      const sql = `INSERT INTO naissance(nomCoupleNaissance,dateNaissance,lieuNaissance,nomEnfantNaissance,datePresentationNaissance,idUtilisateur) VALUES (?,?,?,?,?,?)`;
      const naissanceData: any = await _executeSql(sql, values);
      resolve(naissanceData.insertId);
    } catch (error) {
      reject(error);
    }
  });
};

const recupNaissance = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const sql = `SELECT * FROM naissance ORDER BY idNaissance ASC ;`;
      const naissance = await _selectSql(sql, []);
      resolve(naissance);
    } catch (error) {
      reject(error);
    }
  });
};

const recupNaissanceId = (id: number) => {
  return new Promise(async (resolve, reject) => {
    try {
      const sql = `SELECT * FROM naissance WHERE idNaissance = ? ;`;
      const naissance = await _selectSql(sql, [id]);
      resolve(naissance);
    } catch (error) {
      reject(error);
    }
  });
};

const recupNaissanceByIdUtilsateur = (idUtilisateur: number) => {
  return new Promise(async (resolve, reject) => {
    try {
      const sql = `SELECT * FROM naissance WHERE idUtilisateur= ?;`;
      const naissance = await _selectSql(sql, [idUtilisateur]);
      if (!naissance.length) {
        return reject({ name: "Erreur_naissance", message: "Aucune naissance trouvee" });
      }
      resolve(naissance);
    } catch (error) {
      reject(error);
    }
  });
};

const supprimerNaissance = (idNaissance: number, idUtilisateur?: number): Promise<boolean> => {
  return new Promise(async (resolve, reject) => {
    try {
      const hasUserScope = typeof idUtilisateur === "number";
      const sql = hasUserScope
        ? `DELETE FROM naissance WHERE idNaissance = ? AND idUtilisateur = ?`
        : `DELETE FROM naissance WHERE idNaissance = ?`;
      const params = hasUserScope ? [idNaissance, idUtilisateur] : [idNaissance];

      await _executeSql(sql, params);
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};

const modifierNaissance = (data: INaissance): Promise<boolean> => {
  return new Promise(async (resolve, reject) => {
    try {
      const hasUserScope = typeof data.idUtilisateur === "number";
      const sql = hasUserScope
        ? `UPDATE naissance SET nomCoupleNaissance=?,dateNaissance=?,lieuNaissance=?,nomEnfantNaissance=?,datePresentationNaissance=?,idUtilisateur=? WHERE idNaissance=? AND idUtilisateur=?`
        : `UPDATE naissance SET nomCoupleNaissance=?,dateNaissance=?,lieuNaissance=?,nomEnfantNaissance=?,datePresentationNaissance=?,idUtilisateur=? WHERE idNaissance=?`;
      const params = hasUserScope
        ? [
            data.nomCoupleNaissance,
            data.dateNaissance,
            data.lieuNaissance,
            data.nomEnfantNaissance,
            data.datePresentationNaissance,
            data.idUtilisateur,
            data.idNaissance,
            data.idUtilisateur,
          ]
        : [
            data.nomCoupleNaissance,
            data.dateNaissance,
            data.lieuNaissance,
            data.nomEnfantNaissance,
            data.datePresentationNaissance,
            data.idUtilisateur,
            data.idNaissance,
          ];

      await _executeSql(sql, params);
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};

export default {
  recupNaissance,
  ajouterNaissance,
  supprimerNaissance,
  modifierNaissance,
  recupNaissanceId,
  recupNaissanceByIdUtilsateur,
};
