import { _executeSql, _selectSql } from '../../db';
import { IProgrammeEglise } from './interfaces';

// Ajoute une ligne de programme (un culte planifie) pour une eglise, a une date
// precise. Refuse si un programme existe deja pour cette meme date (on demande
// alors de modifier celui-ci plutot que d'en creer un deuxieme au meme endroit).
const ajouterProgrammeEglise = (data: Partial<IProgrammeEglise>) => {
  return new Promise(async (resolve, reject) => {
    try {
      const idUtilisateur = Number(data.idUtilisateur) || null;
      const dateProgramme = String(data.dateProgramme || '').slice(0, 10);
      const direction = String(data.direction || '').trim();

      if (!idUtilisateur) {
        reject(new Error('Église introuvable.'));
        return;
      }
      if (!dateProgramme) {
        reject(new Error('La date est requise.'));
        return;
      }
      if (!direction) {
        reject(new Error('La direction est requise.'));
        return;
      }

      // Un seul programme autorise par jour et par eglise : on verifie avant d'inserer.
      const existant: any = await _selectSql(
        'SELECT idProgramme FROM programme_eglise WHERE idUtilisateur = ? AND dateProgramme = ? LIMIT 1',
        [idUtilisateur, dateProgramme]
      );
      if (Array.isArray(existant) && existant.length > 0) {
        reject(new Error('Un programme est déjà prévu pour cette date. Modifiez-le plutôt.'));
        return;
      }

      const sql = `INSERT INTO programme_eglise(
        idUtilisateur, dateProgramme, direction, saintCene, predication, offrandes, annonces, thematique
      ) VALUES (?,?,?,?,?,?,?,?)`;
      const result: any = await _executeSql(sql, [
        idUtilisateur,
        dateProgramme,
        direction,
        data.saintCene || '',
        data.predication || '',
        data.offrandes || '',
        data.annonces || '',
        data.thematique || '',
      ]);
      // On relit la ligne fraichement creee pour renvoyer un objet complet
      // (avec son idProgramme et sa dateCreation) au front.
      const inserted: any = await _selectSql('SELECT * FROM programme_eglise WHERE idProgramme = ?', [result.insertId]);
      resolve(inserted[0]);
    } catch (error) {
      reject(error);
    }
  });
};

// Modifie une ligne de programme deja existante.
// Meme regle qu'a l'ajout : pas deux programmes pour la meme date.
const modifierProgrammeEglise = (data: Partial<IProgrammeEglise>) => {
  return new Promise(async (resolve, reject) => {
    try {
      const idProgramme = Number(data.idProgramme) || null;
      const idUtilisateur = Number(data.idUtilisateur) || null;
      const dateProgramme = String(data.dateProgramme || '').slice(0, 10);
      const direction = String(data.direction || '').trim();

      if (!idProgramme || !idUtilisateur) {
        reject(new Error('Programme introuvable.'));
        return;
      }
      if (!dateProgramme) {
        reject(new Error('La date est requise.'));
        return;
      }
      if (!direction) {
        reject(new Error('La direction est requise.'));
        return;
      }

      // On exclut la ligne qu'on est en train de modifier (idProgramme <> ?)
      // pour ne pas se bloquer soi-meme si la date n'a pas change.
      const doublon: any = await _selectSql(
        'SELECT idProgramme FROM programme_eglise WHERE idUtilisateur = ? AND dateProgramme = ? AND idProgramme <> ? LIMIT 1',
        [idUtilisateur, dateProgramme, idProgramme]
      );
      if (Array.isArray(doublon) && doublon.length > 0) {
        reject(new Error('Un autre programme est déjà prévu pour cette date.'));
        return;
      }

      await _executeSql(
        `UPDATE programme_eglise
         SET dateProgramme=?, direction=?, saintCene=?, predication=?, offrandes=?, annonces=?, thematique=?
         WHERE idProgramme=? AND idUtilisateur=?`,
        [
          dateProgramme,
          direction,
          data.saintCene || '',
          data.predication || '',
          data.offrandes || '',
          data.annonces || '',
          data.thematique || '',
          idProgramme,
          idUtilisateur,
        ]
      );
      const updated: any = await _selectSql('SELECT * FROM programme_eglise WHERE idProgramme = ?', [idProgramme]);
      resolve(updated[0]);
    } catch (error) {
      reject(error);
    }
  });
};

// Retire une ligne de programme. Scope par idUtilisateur pour qu'une eglise
// ne puisse jamais supprimer le programme d'une autre eglise.
const supprimerProgrammeEglise = (idProgramme: number, idUtilisateur: number): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    _executeSql('DELETE FROM programme_eglise WHERE idProgramme = ? AND idUtilisateur = ?', [idProgramme, idUtilisateur])
      .then(() => resolve(true))
      .catch((error) => reject(error));
  });
};

// Recupere tout le programme d'une eglise, trie du plus ancien au plus recent
// (l'ecran de gestion regroupe ensuite ces lignes par mois cote client).
const recupProgrammesEgliseByUtilisateur = (idUtilisateur: number) => {
  return new Promise(async (resolve, reject) => {
    try {
      const sql = 'SELECT * FROM programme_eglise WHERE idUtilisateur = ? ORDER BY dateProgramme ASC';
      const programmes = await _selectSql(sql, [idUtilisateur]);
      resolve(programmes);
    } catch (error) {
      reject(error);
    }
  });
};

export default {
  ajouterProgrammeEglise,
  modifierProgrammeEglise,
  supprimerProgrammeEglise,
  recupProgrammesEgliseByUtilisateur,
};
