import { _executeSql, _selectSql } from "../../db";
import { IEglise } from "./interfaces";

// Ajoute une église pour un utilisateur donne.
const ajouterEglise = (data: IEglise) => {
  const values = [data.nomEglise, data.idComptabilite, data.idUtilisateur];

  return new Promise(async (resolve, reject) => {
    try {
      const sql = `INSERT INTO eglise(nomEglise,idComptabilite,idUtilisateur) VALUES (?,?,?)`;
      const egliseData: any = await _executeSql(sql, values);
      resolve(egliseData.insertId);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Récupère toutes les églises.
 */
const recupEglise = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const sql = `SELECT * FROM eglise ORDER BY idEglise ASC ;`;
      const eglise = await _selectSql(sql, []);
      resolve(eglise);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Récupère une église par son identifiant.
 */
const recupEgliseById = (id: number) => {
  return new Promise(async (resolve, reject) => {
    try {
      const sql = `SELECT * FROM eglise WHERE idEglise = ? ;`;
      const eglise = await _selectSql(sql, [id]);
      resolve(eglise);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Récupère l'église rattachée à un utilisateur.
 */
const recupEgliseByUtilisateur = (idUtilisateur: number) => {
  return new Promise(async (resolve, reject) => {
    try {
      const sql = `SELECT * FROM eglise WHERE idUtilisateur = ? ORDER BY idEglise ASC ;`;
      const eglise = await _selectSql(sql, [idUtilisateur]);
      resolve(eglise);
    } catch (error) {
      reject(error);
    }
  });
};

// Supprime l'église. Quand idUtilisateur est fourni, on verrouille la suppression.
const supprimerEglise = (idEglise: number, idUtilisateur?: number): Promise<boolean> => {
  return new Promise(async (resolve, reject) => {
    try {
      const hasUserScope = typeof idUtilisateur === "number";
      const sql = hasUserScope
        ? `DELETE FROM eglise WHERE idEglise = ? AND idUtilisateur = ?`
        : `DELETE FROM eglise WHERE idEglise = ?`;
      const params = hasUserScope ? [idEglise, idUtilisateur] : [idEglise];

      await _executeSql(sql, params);
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};

// Modifie l'église de l'utilisateur cible sans toucher aux autres églises.
const modifierEglise = (data: IEglise): Promise<boolean> => {
  return new Promise(async (resolve, reject) => {
    try {
      const hasUserScope = typeof data.idUtilisateur === "number";
      const sql = hasUserScope
        ? `UPDATE eglise SET nomEglise=?,idComptabilite=? WHERE idEglise=? AND idUtilisateur=?`
        : `UPDATE eglise SET nomEglise=?,idComptabilite=? WHERE idEglise=?`;
      const params = hasUserScope
        ? [data.nomEglise, data.idComptabilite, data.idEglise, data.idUtilisateur]
        : [data.nomEglise, data.idComptabilite, data.idEglise];

      await _executeSql(sql, params);
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};

export default {
  recupEglise,
  ajouterEglise,
  supprimerEglise,
  modifierEglise,
  recupEgliseById,
  recupEgliseByUtilisateur,
};
