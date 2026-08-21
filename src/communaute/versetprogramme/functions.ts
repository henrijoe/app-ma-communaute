import { _executeSql, _selectSql } from '../../db';
import { IVersetProgramme } from './interfaces';

// Ajoute un nouveau verset programme pour une eglise, a une date precise.
// Refuse si un verset existe deja pour cette meme date (on demande alors
// de modifier celui-ci plutot que d'en creer un deuxieme au meme endroit).
const ajouterVersetProgramme = (data: Partial<IVersetProgramme>) => {
  return new Promise(async (resolve, reject) => {
    try {
      const idUtilisateur = Number(data.idUtilisateur) || null;
      const dateAffichage = String(data.dateAffichage || '').slice(0, 10);
      const texte = String(data.texte || '').trim();

      if (!idUtilisateur) {
        reject(new Error('Église introuvable.'));
        return;
      }
      if (!dateAffichage) {
        reject(new Error('La date est requise.'));
        return;
      }
      if (!texte) {
        reject(new Error('Le texte du verset est requis.'));
        return;
      }

      // Un seul verset autorise par jour et par eglise : on verifie avant d'inserer.
      const existant: any = await _selectSql(
        'SELECT idVersetProgramme FROM verset_programme WHERE idUtilisateur = ? AND dateAffichage = ? LIMIT 1',
        [idUtilisateur, dateAffichage]
      );
      if (Array.isArray(existant) && existant.length > 0) {
        reject(new Error('Un verset est déjà programmé pour cette date. Modifiez-le plutôt.'));
        return;
      }

      const sql = 'INSERT INTO verset_programme(idUtilisateur, dateAffichage, reference, texte) VALUES (?,?,?,?)';
      const result: any = await _executeSql(sql, [idUtilisateur, dateAffichage, data.reference || '', texte]);
      // On relit la ligne fraichement creee pour renvoyer un objet complet
      // (avec son idVersetProgramme et sa dateCreation) au front.
      const inserted: any = await _selectSql('SELECT * FROM verset_programme WHERE idVersetProgramme = ?', [result.insertId]);
      resolve(inserted[0]);
    } catch (error) {
      reject(error);
    }
  });
};

// Modifie un verset deja programme (date, reference ou texte).
// Meme regle qu'a l'ajout : pas deux versets pour la meme date.
const modifierVersetProgramme = (data: Partial<IVersetProgramme>) => {
  return new Promise(async (resolve, reject) => {
    try {
      const idVersetProgramme = Number(data.idVersetProgramme) || null;
      const idUtilisateur = Number(data.idUtilisateur) || null;
      const dateAffichage = String(data.dateAffichage || '').slice(0, 10);
      const texte = String(data.texte || '').trim();

      if (!idVersetProgramme || !idUtilisateur) {
        reject(new Error('Verset introuvable.'));
        return;
      }
      if (!dateAffichage) {
        reject(new Error('La date est requise.'));
        return;
      }
      if (!texte) {
        reject(new Error('Le texte du verset est requis.'));
        return;
      }

      // On exclut le verset qu'on est en train de modifier (idVersetProgramme <> ?)
      // pour ne pas se bloquer soi-meme si la date n'a pas change.
      const doublon: any = await _selectSql(
        'SELECT idVersetProgramme FROM verset_programme WHERE idUtilisateur = ? AND dateAffichage = ? AND idVersetProgramme <> ? LIMIT 1',
        [idUtilisateur, dateAffichage, idVersetProgramme]
      );
      if (Array.isArray(doublon) && doublon.length > 0) {
        reject(new Error('Un autre verset est déjà programmé pour cette date.'));
        return;
      }

      await _executeSql(
        'UPDATE verset_programme SET dateAffichage=?, reference=?, texte=? WHERE idVersetProgramme=? AND idUtilisateur=?',
        [dateAffichage, data.reference || '', texte, idVersetProgramme, idUtilisateur]
      );
      const updated: any = await _selectSql('SELECT * FROM verset_programme WHERE idVersetProgramme = ?', [idVersetProgramme]);
      resolve(updated[0]);
    } catch (error) {
      reject(error);
    }
  });
};

// Retire un verset programme. Scope par idUtilisateur pour qu'une eglise
// ne puisse jamais supprimer le verset d'une autre eglise.
const supprimerVersetProgramme = (idVersetProgramme: number, idUtilisateur: number): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    _executeSql('DELETE FROM verset_programme WHERE idVersetProgramme = ? AND idUtilisateur = ?', [idVersetProgramme, idUtilisateur])
      .then(() => resolve(true))
      .catch((error) => reject(error));
  });
};

// Recupere tous les versets programmes d'une eglise, tries du plus ancien
// au plus recent (utilise a la fois par l'ecran de gestion dans Parametres
// et par le tableau de bord pour trouver le verset du jour).
const recupVersetsProgrammeByUtilisateur = (idUtilisateur: number) => {
  return new Promise(async (resolve, reject) => {
    try {
      const sql = 'SELECT * FROM verset_programme WHERE idUtilisateur = ? ORDER BY dateAffichage ASC';
      const versets = await _selectSql(sql, [idUtilisateur]);
      resolve(versets);
    } catch (error) {
      reject(error);
    }
  });
};

export default {
  ajouterVersetProgramme,
  modifierVersetProgramme,
  supprimerVersetProgramme,
  recupVersetsProgrammeByUtilisateur,
};
