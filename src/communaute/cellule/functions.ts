import { _executeSql, _selectSql } from "../../db";
import { ICellule } from "./interfaces";

const ajouterCellule = (data: ICellule) => {
  const values = [
    data.nomCellule,
    data.lieuCellule,
    data.nombreMembreCellule,
    data.responsableCellule,
    data.responsableVisiteCellule,
    data.idUtilisateur,
  ];

  return new Promise(async (resolve, reject) => {
    try {
      // On limite la verification de doublon a l'utilisateur connecte.
      const sqlCheck = `SELECT COUNT(*) as count FROM cellule WHERE idUtilisateur = ? AND nomCellule = ?`;
      const [result] = await _selectSql(sqlCheck, [data.idUtilisateur, data.nomCellule]);

      if (result.count > 0) {
        return reject(new Error("Cette cellule existe deja."));
      }

      const sql = `INSERT INTO cellule(nomCellule,lieuCellule,nombreMembreCellule,responsableCellule,responsableVisiteCellule,idUtilisateur) VALUES (?,?,?,?,?,?)`;
      const celluleData: any = await _executeSql(sql, values);
      resolve(celluleData.insertId);
    } catch (error) {
      reject(error);
    }
  });
};

const recupCellule = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const sql = `SELECT * FROM cellule ORDER BY idCellule ASC ;`;
      const cellule = await _selectSql(sql, []);
      resolve(cellule);
    } catch (error) {
      reject(error);
    }
  });
};

const recupCelluleId = (id: number) => {
  return new Promise(async (resolve, reject) => {
    try {
      const sql = `SELECT * FROM cellule WHERE idCellule = ? ;`;
      const cellule = await _selectSql(sql, [id]);
      resolve(cellule);
    } catch (error) {
      reject(error);
    }
  });
};

const recupCelluleByIdUtilsateur = (idUtilisateur: number) => {
  return new Promise(async (resolve, reject) => {
    try {
      const sql = `SELECT * FROM cellule WHERE idUtilisateur= ?;`;
      const cellule = await _selectSql(sql, [idUtilisateur]);
      if (!cellule.length) {
        return reject({ name: "Erreur_cellule", message: "Aucune cellule trouvee" });
      }
      resolve(cellule);
    } catch (error) {
      reject(error);
    }
  });
};

// Quand l'ID utilisateur est fourni, on empeche la suppression hors perimetre.
const supprimerCellule = (idCellule: number, idUtilisateur?: number): Promise<boolean> => {
  return new Promise(async (resolve, reject) => {
    try {
      const hasUserScope = typeof idUtilisateur === "number";
      const sql = hasUserScope
        ? `DELETE FROM cellule WHERE idCellule = ? AND idUtilisateur = ?`
        : `DELETE FROM cellule WHERE idCellule = ?`;
      const params = hasUserScope ? [idCellule, idUtilisateur] : [idCellule];

      await _executeSql(sql, params);
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};

const modifierCellule = (data: ICellule): Promise<boolean> => {
  return new Promise(async (resolve, reject) => {
    try {
      const hasUserScope = typeof data.idUtilisateur === "number";
      const sql = hasUserScope
        ? `UPDATE cellule SET nomCellule=?,lieuCellule=?,nombreMembreCellule=?,responsableCellule=?,responsableVisiteCellule=?,idUtilisateur=? WHERE idCellule=? AND idUtilisateur=?`
        : `UPDATE cellule SET nomCellule=?,lieuCellule=?,nombreMembreCellule=?,responsableCellule=?,responsableVisiteCellule=?,idUtilisateur=? WHERE idCellule=?`;
      const params = hasUserScope
        ? [
            data.nomCellule,
            data.lieuCellule,
            data.nombreMembreCellule,
            data.responsableCellule,
            data.responsableVisiteCellule,
            data.idUtilisateur,
            data.idCellule,
            data.idUtilisateur,
          ]
        : [
            data.nomCellule,
            data.lieuCellule,
            data.nombreMembreCellule,
            data.responsableCellule,
            data.responsableVisiteCellule,
            data.idUtilisateur,
            data.idCellule,
          ];

      await _executeSql(sql, params);
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};

export default {
  recupCellule,
  ajouterCellule,
  supprimerCellule,
  modifierCellule,
  recupCelluleId,
  recupCelluleByIdUtilsateur,
};
