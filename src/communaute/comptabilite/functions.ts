import { _executeSql, _selectSql } from '../../db';
import { IComptabilite } from './interfaces';

const ajouterComptablilite = (data: IComptabilite) =>
  new Promise(async (resolve, reject) => {
    try {
      const sql = `
        INSERT INTO comptabilite (
          nomComptabilite,
          entreeComptabilite,
          sortieComptabilite,
          dateComptabilite,
          observationComptabilite,
          idUtilisateur
        ) VALUES (?,?,?,?,?,?)
      `;

      const result: any = await _executeSql(sql, [
        data.nomComptabilite,
        data.entreeComptabilite,
        data.sortieComptabilite,
        data.dateComptabilite,
        data.observationComptabilite,
        data.idUtilisateur,
      ]);

      resolve(result.insertId);
    } catch (error) {
      reject(error);
    }
  });

const recupComptabilite = () =>
  new Promise(async (resolve, reject) => {
    try {
      const sql = 'SELECT * FROM comptabilite ORDER BY dateComptabilite DESC, idComptabilite DESC';
      const comptabilites = await _selectSql(sql, []);
      resolve(comptabilites);
    } catch (error) {
      reject(error);
    }
  });

const recupComptabiliteByUtilisateur = (idUtilisateur: number) =>
  new Promise(async (resolve, reject) => {
    try {
      const sql = `
        SELECT *
        FROM comptabilite
        WHERE idUtilisateur = ?
        ORDER BY dateComptabilite DESC, idComptabilite DESC
      `;
      const comptabilites = await _selectSql(sql, [idUtilisateur]);
      resolve(comptabilites);
    } catch (error) {
      reject(error);
    }
  });

const recupComptabiliteById = (id: number) =>
  new Promise(async (resolve, reject) => {
    try {
      const sql = 'SELECT * FROM comptabilite WHERE idComptabilite = ?';
      const comptabilite = await _selectSql(sql, [id]);
      resolve(comptabilite);
    } catch (error) {
      reject(error);
    }
  });

const supprimerComptabilite = (idComptabilite: number): Promise<boolean> =>
  new Promise((resolve, reject) => {
    const sql = 'DELETE FROM comptabilite WHERE idComptabilite = ?';
    _executeSql(sql, [idComptabilite])
      .then(() => resolve(true))
      .catch((error) => reject(error));
  });

const modifierComptabilite = (data: IComptabilite): Promise<boolean> =>
  new Promise(async (resolve, reject) => {
    try {
      const sql = `
        UPDATE comptabilite
        SET
          nomComptabilite = ?,
          entreeComptabilite = ?,
          sortieComptabilite = ?,
          dateComptabilite = ?,
          observationComptabilite = ?,
          idUtilisateur = ?
        WHERE idComptabilite = ?
      `;

      await _executeSql(sql, [
        data.nomComptabilite,
        data.entreeComptabilite,
        data.sortieComptabilite,
        data.dateComptabilite,
        data.observationComptabilite,
        data.idUtilisateur,
        data.idComptabilite,
      ]);

      resolve(true);
    } catch (error) {
      reject(error);
    }
  });

export default {
  ajouterComptablilite,
  recupComptabilite,
  recupComptabiliteByUtilisateur,
  recupComptabiliteById,
  supprimerComptabilite,
  modifierComptabilite,
};
