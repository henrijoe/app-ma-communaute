import { _executeSql, _selectSql } from '../../db';
import { IDeces } from './interfaces';

type ExistingDecesRow = {
  idDeces: number;
  idMembre: number | null;
  idUtilisateur: number | null;
};

const setMemberDeceasedStatus = async (
  idMembre: number | null | undefined,
  idUtilisateur: number | null | undefined,
  isDeceased: boolean,
  dateDeces?: string | null
) => {
  if (!idMembre || !idUtilisateur) {
    return;
  }

  const sql =
    'UPDATE membre SET estDecede = ?, dateDecesMembre = ? WHERE idMembre = ? AND idUtilisateur = ?';
  await _executeSql(sql, [isDeceased ? 1 : 0, isDeceased ? dateDeces || null : null, idMembre, idUtilisateur]);
};

const getExistingDeces = async (idDeces: number): Promise<ExistingDecesRow | null> => {
  const rows = await _selectSql(
    'SELECT idDeces, idMembre, idUtilisateur FROM deces WHERE idDeces = ?',
    [idDeces]
  ) as ExistingDecesRow[];

  return rows?.[0] || null;
};

const ajouterDeces = (data: IDeces) => {
  const values = [
    data.idMembre || null,
    data.nomMembreDeces,
    data.dateDeces,
    data.lieuDeces,
    data.causeDeces,
    data.idUtilisateur,
  ];

  return new Promise(async (resolve, reject) => {
    try {
      const duplicateSql = data.idMembre
        ? 'SELECT COUNT(*) as count FROM deces WHERE idMembre = ? AND idUtilisateur = ?'
        : 'SELECT COUNT(*) as count FROM deces WHERE nomMembreDeces = ? AND idUtilisateur = ?';
      const duplicateParams = data.idMembre
        ? [data.idMembre, data.idUtilisateur]
        : [data.nomMembreDeces, data.idUtilisateur];
      const [result] = await _selectSql(duplicateSql, duplicateParams);

      if (result?.count > 0) {
        return reject(new Error('Ce deces est deja enregistre.'));
      }

      const sql = 'INSERT INTO deces(idMembre, nomMembreDeces, dateDeces, lieuDeces, causeDeces, idUtilisateur) VALUES (?,?,?,?,?,?)';
      const decesData: any = await _executeSql(sql, values);
      await setMemberDeceasedStatus(data.idMembre, data.idUtilisateur, true, data.dateDeces);
      resolve(decesData.insertId);
    } catch (error) {
      reject(error);
    }
  });
};

const recupDeces = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const sql = 'SELECT * FROM deces ORDER BY idDeces ASC;';
      const deces = await _selectSql(sql, []);
      resolve(deces);
    } catch (error) {
      reject(error);
    }
  });
};

const recupDecesId = (id: number) => {
  return new Promise(async (resolve, reject) => {
    try {
      const sql = 'SELECT * FROM deces WHERE idDeces = ?;';
      const deces = await _selectSql(sql, [id]);
      resolve(deces);
    } catch (error) {
      reject(error);
    }
  });
};

const recupDecesByIdUtilsateur = (idUtilisateur: number) => {
  return new Promise(async (resolve, reject) => {
    try {
      const sql = 'SELECT * FROM deces WHERE idUtilisateur = ?;';
      const deces = await _selectSql(sql, [idUtilisateur]);
      if (!deces.length) return reject({ name: 'Erreur_deces', message: 'Aucun deces trouve' });
      resolve(deces);
    } catch (error) {
      reject(error);
    }
  });
};

const supprimerDeces = (idDeces: number): Promise<boolean> => {
  return new Promise(async (resolve, reject) => {
    try {
      const existingDeces = await getExistingDeces(idDeces);
      await _executeSql('DELETE FROM deces WHERE idDeces = ?', [idDeces]);
      if (existingDeces) {
        await setMemberDeceasedStatus(existingDeces.idMembre, existingDeces.idUtilisateur, false, null);
      }
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};

const modifierDeces = (data: IDeces): Promise<boolean> => {
  return new Promise(async (resolve, reject) => {
    try {
      const existingDeces = data.idDeces ? await getExistingDeces(data.idDeces) : null;
      await _executeSql(
        'UPDATE deces SET idMembre = ?, nomMembreDeces = ?, dateDeces = ?, lieuDeces = ?, causeDeces = ?, idUtilisateur = ? WHERE idDeces = ?',
        [
          data.idMembre || null,
          data.nomMembreDeces,
          data.dateDeces,
          data.lieuDeces,
          data.causeDeces,
          data.idUtilisateur,
          data.idDeces,
        ]
      );

      if (existingDeces && existingDeces.idMembre && existingDeces.idMembre !== data.idMembre) {
        await setMemberDeceasedStatus(existingDeces.idMembre, existingDeces.idUtilisateur, false, null);
      }

      await setMemberDeceasedStatus(data.idMembre, data.idUtilisateur, true, data.dateDeces);
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};

export default {
  recupDeces,
  ajouterDeces,
  supprimerDeces,
  modifierDeces,
  recupDecesId,
  recupDecesByIdUtilsateur,
};
