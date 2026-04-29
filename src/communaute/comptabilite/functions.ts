import { DESKTOP_SUPERADMIN_USERNAME } from '../../db/sqliteSecurity';
import { _executeSql, _selectSql } from '../../db';
import { IComptabilite } from './interfaces';

const normalizeUsername = (value?: string | null) => String(value || '').trim().toLowerCase();

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

const baseSelect = `
  SELECT
    comptabilite.*,
    utilisateur.nomUtilisateur AS nomUtilisateurSuppression
  FROM comptabilite
  LEFT JOIN utilisateur ON utilisateur.idUtilisateur = comptabilite.supprimeParUtilisateur
`;

const recupComptabilite = () =>
  new Promise(async (resolve, reject) => {
    try {
      const sql = `${baseSelect}
        WHERE COALESCE(comptabilite.estSupprimeComptabilite, 0) <> 1
        ORDER BY comptabilite.dateComptabilite DESC, comptabilite.idComptabilite DESC
      `;
      const comptabilites = await _selectSql(sql, []);
      resolve(comptabilites);
    } catch (error) {
      reject(error);
    }
  });

const recupComptabiliteByUtilisateur = (idUtilisateur: number) =>
  new Promise(async (resolve, reject) => {
    try {
      const sql = `${baseSelect}
        WHERE comptabilite.idUtilisateur = ?
          AND COALESCE(comptabilite.estSupprimeComptabilite, 0) <> 1
        ORDER BY comptabilite.dateComptabilite DESC, comptabilite.idComptabilite DESC
      `;
      const comptabilites = await _selectSql(sql, [idUtilisateur]);
      resolve(comptabilites);
    } catch (error) {
      reject(error);
    }
  });

const recupComptabiliteSupprimeeByUtilisateur = (idUtilisateur: number) =>
  new Promise(async (resolve, reject) => {
    try {
      const sql = `${baseSelect}
        WHERE comptabilite.idUtilisateur = ?
          AND COALESCE(comptabilite.estSupprimeComptabilite, 0) = 1
        ORDER BY COALESCE(comptabilite.dateSuppressionComptabilite, comptabilite.dateComptabilite) DESC, comptabilite.idComptabilite DESC
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
      const sql = `${baseSelect} WHERE comptabilite.idComptabilite = ?`;
      const comptabilite = await _selectSql(sql, [id]);
      resolve(comptabilite);
    } catch (error) {
      reject(error);
    }
  });

const supprimerComptabilite = (
  idComptabilite: number,
  supprimeParUtilisateur?: number | null,
  motifSuppressionComptabilite?: string | null
): Promise<boolean> =>
  new Promise((resolve, reject) => {
    const sql = `
      UPDATE comptabilite
      SET
        estSupprimeComptabilite = 1,
        dateSuppressionComptabilite = CURRENT_TIMESTAMP,
        motifSuppressionComptabilite = ?,
        supprimeParUtilisateur = ?
      WHERE idComptabilite = ?
    `;
    _executeSql(sql, [
      motifSuppressionComptabilite || 'Suppression depuis la liste comptable',
      supprimeParUtilisateur || null,
      idComptabilite,
    ])
      .then(() => resolve(true))
      .catch((error) => reject(error));
  });

const restaurerComptabilite = (idComptabilite: number): Promise<boolean> =>
  new Promise((resolve, reject) => {
    const sql = `
      UPDATE comptabilite
      SET
        estSupprimeComptabilite = 0,
        dateSuppressionComptabilite = NULL,
        motifSuppressionComptabilite = NULL,
        supprimeParUtilisateur = NULL
      WHERE idComptabilite = ?
    `;
    _executeSql(sql, [idComptabilite])
      .then(() => resolve(true))
      .catch((error) => reject(error));
  });

const supprimerComptabiliteDefinitivement = (
  idComptabilite: number,
  nomUtilisateur?: string | null
): Promise<boolean> =>
  new Promise((resolve, reject) => {
    if (normalizeUsername(nomUtilisateur) !== normalizeUsername(DESKTOP_SUPERADMIN_USERNAME)) {
      reject(new Error('Seul le superadmin peut supprimer definitivement une ecriture comptable.'));
      return;
    }

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
  recupComptabiliteSupprimeeByUtilisateur,
  recupComptabiliteById,
  supprimerComptabilite,
  restaurerComptabilite,
  supprimerComptabiliteDefinitivement,
  modifierComptabilite,
};
