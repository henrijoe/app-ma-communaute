import { _executeSql, _selectSql } from "../../db";
import { IDepartement } from "./interfaces";

const ajouterDepartement = (data: IDepartement) => {
  const values = [
    data.libelleLongDepartement,
    data.libelleCourtDepartement,
    data.sloganDepartement,
    data.responsableDepartement,
    data.idUtilisateur,
  ];

  return new Promise(async (resolve, reject) => {
    try {
      // La verification de doublon reste locale a l'utilisateur pour ne pas bloquer une autre eglise.
      const sqlCheck = `SELECT COUNT(*) as count FROM departement WHERE idUtilisateur = ? AND (libelleLongDepartement = ? OR libelleCourtDepartement = ?)`;
      const [result] = await _selectSql(sqlCheck, [
        data.idUtilisateur,
        data.libelleLongDepartement,
        data.libelleCourtDepartement,
      ]);

      if (result.count > 0) {
        return reject(new Error("Ce departement existe déjà."));
      }

      const sqlInsert = `INSERT INTO departement(libelleLongDepartement,libelleCourtDepartement,sloganDepartement,responsableDepartement,idUtilisateur) VALUES (?,?,?,?,?)`;
      const departement: any = await _executeSql(sqlInsert, values);
      
      resolve(departement.insertId);
    } catch (error) {
      reject(error);
    }
  });
};

const recupDepartement = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const sql = `SELECT * FROM departement ORDER BY idDepartement ASC ;`;
      const departement = await _selectSql(sql, []);
      resolve(departement);
    } catch (error) {
      reject(error);
    }
  });
};

const recupDepartementById = (id: number) => {
  return new Promise(async (resolve, reject) => {
    try {
      const sql = `SELECT * FROM departement WHERE idDepartement = ? ;`;
      const departement = await _selectSql(sql, [id]);
      resolve(departement);
    } catch (error) {
      reject(error);
    }
  });
};

const recupDepartementByIdUtilsateur = (idUtilisateur: number) => {
  return new Promise(async (resolve, reject) => {
    try {
      const sql = `SELECT * FROM departement WHERE idUtilisateur= ?;`;
      const departements = await _selectSql(sql, [idUtilisateur]);
      if (!departements.length) {
        return reject({ name: "Erreur_departement", message: "Aucun departement trouve" });
      }
      resolve(departements);
    } catch (error) {
      reject(error);
    }
  });
};

const supprimerDepartement = (idDepartement: number, idUtilisateur: number): Promise<boolean> => {
  return new Promise(async (resolve, reject) => {
    try {
      const sql = `DELETE FROM departement WHERE idDepartement = ? AND idUtilisateur = ?`;
      await _executeSql(sql, [idDepartement, idUtilisateur]);
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};

const modifierDepartement = (data: IDepartement): Promise<boolean> => {
  return new Promise(async (resolve, reject) => {
    try {
      const sql = `UPDATE departement SET libelleLongDepartement=?,libelleCourtDepartement=?,sloganDepartement=?,responsableDepartement=? WHERE idDepartement=? AND idUtilisateur=?`;
      await _executeSql(sql, [
        data.libelleLongDepartement,
        data.libelleCourtDepartement,
        data.sloganDepartement,
        data.responsableDepartement,
        data.idDepartement,
        data.idUtilisateur,
      ]);
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};

export default {
  ajouterDepartement,
  recupDepartement,
  supprimerDepartement,
  modifierDepartement,
  recupDepartementById,
  recupDepartementByIdUtilsateur,
};
