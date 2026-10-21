import { _executeSql, _selectSql } from "../../db";
import { IGroupe } from "./interfaces";

const ajouterGroupe = (data: IGroupe) => {
  const values = [
    data.libelleGroupe,
    data.descriptionGroupe || "",
    data.responsableGroupe || "",
    data.idUtilisateur,
  ];

  return new Promise(async (resolve, reject) => {
    try {
      // Le doublon doit être verifie par utilisateur pour isoler les églises.
      const sqlCheck = `SELECT COUNT(*) as count FROM groupe WHERE idUtilisateur = ? AND libelleGroupe = ?`;
      const [result] = await _selectSql(sqlCheck, [data.idUtilisateur, data.libelleGroupe]);

      if (result.count > 0) {
        return reject(new Error("Ce groupe existe déjà."));
      }

      const sql = `INSERT INTO groupe(libelleGroupe,descriptionGroupe,responsableGroupe,idUtilisateur) VALUES (?,?,?,?)`;
      const groupeData: any = await _executeSql(sql, values);
      resolve(groupeData.insertId);
    } catch (error) {
      reject(error);
    }
  });
};

const recupGroupe = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const sql = `SELECT * FROM groupe ORDER BY idGroupe ASC ;`;
      const groupe = await _selectSql(sql, []);
      resolve(groupe);
    } catch (error) {
      reject(error);
    }
  });
};

const recupGroupeId = (id: number) => {
  return new Promise(async (resolve, reject) => {
    try {
      const sql = `SELECT * FROM groupe WHERE idGroupe = ? ;`;
      const groupe = await _selectSql(sql, [id]);
      resolve(groupe);
    } catch (error) {
      reject(error);
    }
  });
};

const recupGroupeByIdUtilsateur = (idUtilisateur: number) => {
  return new Promise(async (resolve, reject) => {
    try {
      const sql = `SELECT * FROM groupe WHERE idUtilisateur= ?;`;
      const groupes = await _selectSql(sql, [idUtilisateur]);
      // Une liste vide est un résultat valide, pas une erreur.
      resolve(groupes);
    } catch (error) {
      reject(error);
    }
  });
};

const supprimerGroupe = (idGroupe: number, idUtilisateur?: number): Promise<boolean> => {
  return new Promise(async (resolve, reject) => {
    try {
      const hasUserScope = typeof idUtilisateur === "number";
      const sql = hasUserScope
        ? `DELETE FROM groupe WHERE idGroupe = ? AND idUtilisateur = ?`
        : `DELETE FROM groupe WHERE idGroupe = ?`;
      const params = hasUserScope ? [idGroupe, idUtilisateur] : [idGroupe];

      await _executeSql(sql, params);
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};

const modifierGroupe = (data: IGroupe): Promise<boolean> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Correction importante: l'ordre des paramètres doit suivre l'ordre des placeholders SQL.
      const hasUserScope = typeof data.idUtilisateur === "number";
      const sql = hasUserScope
        ? `UPDATE groupe SET libelleGroupe=?, descriptionGroupe=?, responsableGroupe=?, idUtilisateur=? WHERE idGroupe=? AND idUtilisateur=?`
        : `UPDATE groupe SET libelleGroupe=?, descriptionGroupe=?, responsableGroupe=?, idUtilisateur=? WHERE idGroupe=?`;
      const params = hasUserScope
        ? [
            data.libelleGroupe,
            data.descriptionGroupe || "",
            data.responsableGroupe || "",
            data.idUtilisateur,
            data.idGroupe,
            data.idUtilisateur,
          ]
        : [
            data.libelleGroupe,
            data.descriptionGroupe || "",
            data.responsableGroupe || "",
            data.idUtilisateur,
            data.idGroupe,
          ];

      await _executeSql(sql, params);
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};

export default {
  recupGroupe,
  ajouterGroupe,
  supprimerGroupe,
  modifierGroupe,
  recupGroupeId,
  recupGroupeByIdUtilsateur,
};
