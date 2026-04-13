import fs from 'fs';

import { _executeSql, _selectSql } from '../../db';
import { getAvatarsPath, saveFileToBase64 } from '../functions';
import { IMembre } from './interfaces';

const ajouterMembre = (data: IMembre) => {
  const values = [
    data.nomMembre || '',
    data.prenomMembre || '',
    data.dateNaissMembre || null,
    data.lieuNaissMembre || '',
    data.sexeMembre || null,
    data.emailMembre || '',
    data.nationaliteMembre || '',
    data.fonctionMembre || '',
    data.contactMembre || '',
    data.ethnieMembre || '',
    data.residenceMembre || '',
    data.civiliteMembre || '',
    data.nouvelleAmeMembre || null,
    data.dateConversionMembre || null,
    data.baptemeEauMembre || null,
    data.dateBaptemeMembre || null,
    data.dateMariageMembre || null,
    data.capaciteSpirituelleMembre || null,
    data.situationMatrimonialeMembre || null,
    data.nomFiance || '',
    data.photoMembre || '',
    data.lieuBaptemeEauMembre || '',
    data.baptemeSaintEspritMembre || null,
    data.dateBaptemeSaintEspritMembre || null,
    data.egliseOrigineMembre || '',
    data.nomAmiEglise || '',
    data.visiteMembre || null,
    data.raisonNonVisiteMembre || '',
    data.heureVisiteMembre || '',
    data.dateDecisionMembre || null,
    data.lieuTravailMembre || '',
    data.idNiveauEtude || null,
    data.idCellule || null,
    data.idDepartement || null,
    data.idGroupe || null,
    data.idResponsabilite || null,
    data.estDecede ?? 0,
    data.dateDecesMembre ?? null,
    data.idUtilisateur || null,
  ];

  return new Promise(async (resolve, reject) => {
    try {
      let fileName: string | null = null;

      if (data.photoMembre && data.photoMembre.trim() !== '' && data.photoMembre.startsWith('data:image/')) {
        const base64Data = data.photoMembre.replace(/^data:image\/\w+;base64,/, '');
        fileName = `temp_${Date.now()}.jpg`;
        const filePath = getAvatarsPath(fileName);
        await saveFileToBase64(filePath, base64Data);
        values[20] = fileName;
      }

      const sql = `INSERT INTO membre(
        nomMembre,
        prenomMembre,
        dateNaissMembre,
        lieuNaissMembre,
        sexeMembre,
        emailMembre,
        nationaliteMembre,
        fonctionMembre,
        contactMembre,
        ethnieMembre,
        residenceMembre,
        civiliteMembre,
        nouvelleAmeMembre,
        dateConversionMembre,
        baptemeEauMembre,
        dateBaptemeMembre,
        dateMariageMembre,
        capaciteSpirituelleMembre,
        situationMatrimonialeMembre,
        nomFiance,
        photoMembre,
        lieuBaptemeEauMembre,
        baptemeSaintEspritMembre,
        dateBaptemeSaintEspritMembre,
        egliseOrigineMembre,
        nomAmiEglise,
        visiteMembre,
        raisonNonVisiteMembre,
        heureVisiteMembre,
        dateDecisionMembre,
        lieuTravailMembre,
        idNiveauEtude,
        idCellule,
        idDepartement,
        idGroupe,
        idResponsabilite,
        estDecede,
        dateDecesMembre,
        idUtilisateur
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

      const membreInserted: any = await _executeSql(sql, values);
      const insertedId = membreInserted.insertId;

      if (fileName && fileName.startsWith('temp_') && insertedId) {
        try {
          const oldPath = getAvatarsPath(fileName);
          const newFileName = `membre_${insertedId}.jpg`;
          const newPath = getAvatarsPath(newFileName);

          if (fs.existsSync(oldPath)) {
            fs.renameSync(oldPath, newPath);
            await _executeSql('UPDATE membre SET photoMembre = ? WHERE idMembre = ?', [newFileName, insertedId]);
          }
        } catch (renameError) {
          console.error('Erreur lors du renommage:', renameError);
        }
      }

      const membre: any = await recupMembreById(insertedId);
      resolve(membre[0]);
    } catch (error) {
      console.error('Erreur dans ajouterMembre:', error);
      reject(error);
    }
  });
};

const recupMembre = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const sql = 'SELECT * FROM membre ORDER BY idMembre ASC;';
      const membre = await _selectSql(sql, []);
      if (!membre.length) return reject({ name: 'Erreur_membre', message: 'Aucun membre trouve' });
      resolve(membre);
    } catch (error) {
      reject(error);
    }
  });
};

const recupMembreById = (id: number) => {
  return new Promise(async (resolve, reject) => {
    try {
      const sql = 'SELECT * FROM membre WHERE idMembre = ?;';
      const membre = await _selectSql(sql, [id]);
      if (!membre.length) return reject({ name: 'Erreur_membre', message: 'Aucun membre trouve' });
      resolve(membre);
    } catch (error) {
      reject(error);
    }
  });
};

const recupMembreByIdUtilsateur = (idUtilisateur: number) => {
  return new Promise(async (resolve, reject) => {
    try {
      const sql = 'SELECT * FROM membre WHERE idUtilisateur = ?;';
      const membre = await _selectSql(sql, [idUtilisateur]);
      if (!membre.length) return reject({ name: 'Erreur_membre', message: 'Aucun membre trouve' });
      resolve(membre);
    } catch (error) {
      reject(error);
    }
  });
};

const supprimerMembre = (idMembre: number, idUtilisateur?: number | null): Promise<boolean> => {
  return new Promise(async (resolve, reject) => {
    try {
      const sql = idUtilisateur
        ? 'DELETE FROM membre WHERE idMembre = ? AND idUtilisateur = ?'
        : 'DELETE FROM membre WHERE idMembre = ?';
      const result: any = await _executeSql(sql, idUtilisateur ? [idMembre, idUtilisateur] : [idMembre]);
      resolve(Boolean(result?.affectedRows));
    } catch (error) {
      reject(error);
    }
  });
};

const modifierMembre = (data: IMembre): Promise<boolean> => {
  return new Promise(async (resolve, reject) => {
    try {
      const sql = `UPDATE membre SET
        nomMembre = ?,
        prenomMembre = ?,
        dateNaissMembre = ?,
        lieuNaissMembre = ?,
        sexeMembre = ?,
        emailMembre = ?,
        nationaliteMembre = ?,
        fonctionMembre = ?,
        contactMembre = ?,
        ethnieMembre = ?,
        residenceMembre = ?,
        civiliteMembre = ?,
        nouvelleAmeMembre = ?,
        dateConversionMembre = ?,
        baptemeEauMembre = ?,
        dateBaptemeMembre = ?,
        dateMariageMembre = ?,
        capaciteSpirituelleMembre = ?,
        situationMatrimonialeMembre = ?,
        nomFiance = ?,
        photoMembre = ?,
        lieuBaptemeEauMembre = ?,
        baptemeSaintEspritMembre = ?,
        dateBaptemeSaintEspritMembre = ?,
        egliseOrigineMembre = ?,
        nomAmiEglise = ?,
        visiteMembre = ?,
        raisonNonVisiteMembre = ?,
        heureVisiteMembre = ?,
        dateDecisionMembre = ?,
        lieuTravailMembre = ?,
        idNiveauEtude = ?,
        idCellule = ?,
        idDepartement = ?,
        idGroupe = ?,
        idResponsabilite = ?,
        estDecede = ?,
        dateDecesMembre = ?,
        idUtilisateur = ?
        WHERE idMembre = ? AND idUtilisateur = ?`;
      await _executeSql(sql, [
        data.nomMembre,
        data.prenomMembre,
        data.dateNaissMembre,
        data.lieuNaissMembre,
        data.sexeMembre,
        data.emailMembre,
        data.nationaliteMembre,
        data.fonctionMembre,
        data.contactMembre,
        data.ethnieMembre,
        data.residenceMembre,
        data.civiliteMembre,
        data.nouvelleAmeMembre,
        data.dateConversionMembre,
        data.baptemeEauMembre,
        data.dateBaptemeMembre,
        data.dateMariageMembre,
        data.capaciteSpirituelleMembre,
        data.situationMatrimonialeMembre,
        data.nomFiance,
        data.photoMembre,
        data.lieuBaptemeEauMembre,
        data.baptemeSaintEspritMembre,
        data.dateBaptemeSaintEspritMembre,
        data.egliseOrigineMembre,
        data.nomAmiEglise,
        data.visiteMembre,
        data.raisonNonVisiteMembre,
        data.heureVisiteMembre,
        data.dateDecisionMembre,
        data.lieuTravailMembre,
        data.idNiveauEtude,
        data.idCellule,
        data.idDepartement,
        data.idGroupe,
        data.idResponsabilite,
        data.estDecede ?? 0,
        data.dateDecesMembre ?? null,
        data.idUtilisateur,
        data.idMembre,
        data.idUtilisateur,
      ]);
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};

export default {
  recupMembre,
  ajouterMembre,
  supprimerMembre,
  modifierMembre,
  recupMembreById,
  recupMembreByIdUtilsateur,
};
