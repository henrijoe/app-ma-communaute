import { _executeSql, _selectSql } from "../../db";
import { ICellule } from "./interfaces";

const normalizeCelluleData = (data: Partial<ICellule>): ICellule => ({
  idCellule: Number(data.idCellule || 0),
  idUtilisateur: Number(data.idUtilisateur || 0),
  nomCellule: String(data.nomCellule || "").trim(),
  lieuCellule: String(data.lieuCellule || "").trim(),
  nombreMembreCellule: String(data.nombreMembreCellule || "0"),
  responsableCellule: String(data.responsableCellule || ""),
  responsableVisiteCellule: String(data.responsableVisiteCellule || ""),
});

const getNextCelluleId = async (): Promise<number> => {
  const [result] = await _selectSql(
    `SELECT COALESCE(MAX(idCellule), 0) + 1 AS nextId FROM cellule`,
    []
  );

  return Number(result?.nextId || 1);
};

const ajouterCellule = (data: ICellule) => {
  const cellule = normalizeCelluleData(data);

  return new Promise(async (resolve, reject) => {
    try {
      if (!cellule.nomCellule || !cellule.lieuCellule) {
        return reject(new Error("Le nom et le lieu de la cellule sont requis."));
      }

      // On limite la verification de doublon a l'utilisateur connecte.
      const sqlCheck = `SELECT COUNT(*) as count FROM cellule WHERE idUtilisateur = ? AND nomCellule = ?`;
      const [result] = await _selectSql(sqlCheck, [cellule.idUtilisateur, cellule.nomCellule]);

      if (result.count > 0) {
        return reject(new Error("Cette cellule existe deja."));
      }

      const nextCelluleId = cellule.idCellule || await getNextCelluleId();
      const values = [
        nextCelluleId,
        cellule.nomCellule,
        cellule.lieuCellule,
        cellule.nombreMembreCellule,
        cellule.responsableCellule,
        cellule.responsableVisiteCellule,
        cellule.idUtilisateur,
      ];

      const sql = `INSERT INTO cellule(idCellule,nomCellule,lieuCellule,nombreMembreCellule,responsableCellule,responsableVisiteCellule,idUtilisateur) VALUES (?,?,?,?,?,?,?)`;
      await _executeSql(sql, values);
      resolve(nextCelluleId);
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
      const cellule = normalizeCelluleData(data);

      if (!cellule.idCellule) {
        return reject(new Error("Identifiant de cellule introuvable."));
      }

      if (!cellule.nomCellule || !cellule.lieuCellule) {
        return reject(new Error("Le nom et le lieu de la cellule sont requis."));
      }

      const hasUserScope = Boolean(cellule.idUtilisateur);
      const sql = hasUserScope
        ? `UPDATE cellule SET nomCellule=?,lieuCellule=?,nombreMembreCellule=?,responsableCellule=?,responsableVisiteCellule=?,idUtilisateur=? WHERE idCellule=? AND idUtilisateur=?`
        : `UPDATE cellule SET nomCellule=?,lieuCellule=?,nombreMembreCellule=?,responsableCellule=?,responsableVisiteCellule=?,idUtilisateur=? WHERE idCellule=?`;
      const params = hasUserScope
        ? [
            cellule.nomCellule,
            cellule.lieuCellule,
            cellule.nombreMembreCellule,
            cellule.responsableCellule,
            cellule.responsableVisiteCellule,
            cellule.idUtilisateur,
            cellule.idCellule,
            cellule.idUtilisateur,
          ]
        : [
            cellule.nomCellule,
            cellule.lieuCellule,
            cellule.nombreMembreCellule,
            cellule.responsableCellule,
            cellule.responsableVisiteCellule,
            cellule.idUtilisateur,
            cellule.idCellule,
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
