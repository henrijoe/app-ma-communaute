import fs from 'fs';

import { _executeSql, _selectSql } from '../../db';
import { getAvatarsPath, saveFileToBase64 } from '../functions';
import { IMembre } from './interfaces';

const normalizeDuplicatePhone = (value: unknown): string => String(value ?? '').replace(/\D/g, '');
const normalizeDuplicateName = (value: unknown): string => String(value ?? '').trim().toLowerCase().replace(/\s+/g, ' ');

const normalizeDuplicateBirthDate = (value: unknown): string => {
  const raw = String(value ?? '').trim();

  if (!raw) return '';
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);

  const frenchMatch = raw.match(/^(\d{2})[/-](\d{2})[/-](\d{4})$/);
  if (frenchMatch) {
    return `${frenchMatch[3]}-${frenchMatch[2]}-${frenchMatch[1]}`;
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;

  return parsed.toISOString().slice(0, 10);
};

const recupMembreDoublon = async (
  idUtilisateur: number | null | undefined,
  contactMembre: string | null | undefined,
  dateNaissMembre: string | null | undefined,
  ignoredMemberId?: number | null
): Promise<any | null> => {
  const normalizedPhone = normalizeDuplicatePhone(contactMembre);
  const normalizedBirthDate = normalizeDuplicateBirthDate(dateNaissMembre);

  if (!idUtilisateur || !normalizedPhone || !normalizedBirthDate) {
    return null;
  }

  const params: any[] = [idUtilisateur, normalizedPhone, normalizedBirthDate];
  let sql = `
    SELECT *
    FROM membre
    WHERE idUtilisateur = ?
      AND REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(IFNULL(contactMembre, ''), ' ', ''), '-', ''), '.', ''), '/', ''), '+', ''), '(', ''), ')', '') = ?
      AND substr(IFNULL(dateNaissMembre, ''), 1, 10) = ?
  `;

  if (ignoredMemberId) {
    sql += ' AND idMembre <> ?';
    params.push(ignoredMemberId);
  }

  sql += ' LIMIT 1';

  const rows: any = await _selectSql(sql, params);
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
};

const recupMembreDoublonByIdentity = async (
  idUtilisateur: number | null | undefined,
  nomMembre: string | null | undefined,
  prenomMembre: string | null | undefined,
  contactMembre: string | null | undefined,
  ignoredMemberId?: number | null
): Promise<any | null> => {
  const normalizedPhone = normalizeDuplicatePhone(contactMembre);
  const normalizedNom = normalizeDuplicateName(nomMembre);
  const normalizedPrenom = normalizeDuplicateName(prenomMembre);

  if (!idUtilisateur || !normalizedPhone || !normalizedNom) {
    return null;
  }

  const params: any[] = [idUtilisateur, normalizedPhone, normalizedNom, normalizedPrenom];
  let sql = `
    SELECT *
    FROM membre
    WHERE idUtilisateur = ?
      AND REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(IFNULL(contactMembre, ''), ' ', ''), '-', ''), '.', ''), '/', ''), '+', ''), '(', ''), ')', '') = ?
      AND LOWER(TRIM(IFNULL(nomMembre, ''))) = ?
      AND LOWER(TRIM(IFNULL(prenomMembre, ''))) = ?
  `;

  if (ignoredMemberId) {
    sql += ' AND idMembre <> ?';
    params.push(ignoredMemberId);
  }

  sql += ' LIMIT 1';

  const rows: any = await _selectSql(sql, params);
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
};

const recupDemandeInscriptionDoublon = async (
  idUtilisateur: number | null | undefined,
  nomMembre: string | null | undefined,
  prenomMembre: string | null | undefined,
  contactMembre: string | null | undefined
): Promise<any | null> => {
  const normalizedPhone = normalizeDuplicatePhone(contactMembre);
  const normalizedNom = normalizeDuplicateName(nomMembre);
  const normalizedPrenom = normalizeDuplicateName(prenomMembre);

  if (!idUtilisateur || !normalizedPhone || !normalizedNom) {
    return null;
  }

  const sql = `
    SELECT *
    FROM membre_inscription_demande
    WHERE idUtilisateur = ?
      AND statutDemande = 'en_attente'
      AND REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(IFNULL(contactMembre, ''), ' ', ''), '-', ''), '.', ''), '/', ''), '+', ''), '(', ''), ')', '') = ?
      AND LOWER(TRIM(IFNULL(nomMembre, ''))) = ?
      AND LOWER(TRIM(IFNULL(prenomMembre, ''))) = ?
    LIMIT 1
  `;

  const rows: any = await _selectSql(sql, [idUtilisateur, normalizedPhone, normalizedNom, normalizedPrenom]);
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
};

const normalizeDemandeInscriptionMembre = (demande: any) => {
  let payload: any = {};
  try {
    payload = JSON.parse(demande.payloadDemande || '{}');
  } catch (_error) {
    payload = {};
  }
  return { ...demande, payloadDemande: payload };
};

const recupDemandeInscriptionMembreById = (idDemandeInscription: number) => {
  return new Promise(async (resolve, reject) => {
    try {
      const sql = 'SELECT * FROM membre_inscription_demande WHERE idDemandeInscription = ?;';
      const demandes: any = await _selectSql(sql, [idDemandeInscription]);
      if (!demandes.length) return reject({ name: 'Erreur_demande_inscription', message: "Aucune demande d'inscription trouvee" });
      resolve(demandes.map(normalizeDemandeInscriptionMembre));
    } catch (error) {
      reject(error);
    }
  });
};

const recupDemandesInscriptionMembreByUtilisateur = (idUtilisateur: number) => {
  return new Promise(async (resolve, reject) => {
    try {
      const sql = `SELECT *
        FROM membre_inscription_demande
        WHERE idUtilisateur = ? AND statutDemande = 'en_attente'
        ORDER BY idDemandeInscription DESC;`;
      const demandes: any = await _selectSql(sql, [idUtilisateur]);
      resolve(demandes.map(normalizeDemandeInscriptionMembre));
    } catch (error) {
      reject(error);
    }
  });
};

const ajouterDemandeInscriptionMembre = (data: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      const payload = { ...data, idUtilisateur: Number(data.idUtilisateur) || null };

      if (!payload.idUtilisateur) {
        reject(new Error("Lien d'inscription incomplet."));
        return;
      }
      if (!String(payload.nomMembre || '').trim()) {
        reject(new Error('Le nom du membre est requis.'));
        return;
      }
      if (!String(payload.contactMembre || '').trim()) {
        reject(new Error('Le telephone du membre est requis.'));
        return;
      }

      const doublonMembre = await recupMembreDoublonByIdentity(payload.idUtilisateur, payload.nomMembre, payload.prenomMembre, payload.contactMembre);
      if (doublonMembre) {
        reject(new Error('Ce membre est deja enregistre dans la communaute.'));
        return;
      }

      const doublonDemande = await recupDemandeInscriptionDoublon(payload.idUtilisateur, payload.nomMembre, payload.prenomMembre, payload.contactMembre);
      if (doublonDemande) {
        reject(new Error("Une demande d'inscription est deja en attente pour ce membre."));
        return;
      }

      const sql = `INSERT INTO membre_inscription_demande(
        idUtilisateur,
        nomMembre,
        prenomMembre,
        contactMembre,
        payloadDemande,
        statutDemande
      ) VALUES (?,?,?,?,?,?)`;

      const result: any = await _executeSql(sql, [
        payload.idUtilisateur,
        payload.nomMembre || '',
        payload.prenomMembre || '',
        payload.contactMembre || '',
        JSON.stringify(payload),
        'en_attente',
      ]);

      const insertedId = result.insertId;
      const demande: any = await recupDemandeInscriptionMembreById(insertedId);
      resolve(demande[0]);
    } catch (error) {
      reject(error);
    }
  });
};

const validerDemandeInscriptionMembre = (idDemandeInscription: number, idUtilisateur: number) => {
  return new Promise(async (resolve, reject) => {
    try {
      const demandes: any = await recupDemandeInscriptionMembreById(idDemandeInscription);
      const demande = demandes[0];

      if (Number(demande.idUtilisateur) !== Number(idUtilisateur)) {
        reject(new Error("Cette demande ne correspond pas a l'eglise connectee."));
        return;
      }
      if (demande.statutDemande !== 'en_attente') {
        reject(new Error('Cette demande a deja ete traitee.'));
        return;
      }

      const membreCree: any = await ajouterMembre({ ...demande.payloadDemande, idUtilisateur });

      await _executeSql(`UPDATE membre_inscription_demande
        SET statutDemande = 'validee', idMembreCree = ?, dateTraitement = CURRENT_TIMESTAMP
        WHERE idDemandeInscription = ? AND idUtilisateur = ?`, [
        membreCree.idMembre,
        idDemandeInscription,
        idUtilisateur,
      ]);

      resolve(membreCree);
    } catch (error) {
      reject(error);
    }
  });
};

const rejeterDemandeInscriptionMembre = (idDemandeInscription: number, idUtilisateur: number) => {
  return new Promise(async (resolve, reject) => {
    try {
      const sql = `UPDATE membre_inscription_demande
        SET statutDemande = 'rejetee', dateTraitement = CURRENT_TIMESTAMP
        WHERE idDemandeInscription = ? AND idUtilisateur = ? AND statutDemande = 'en_attente'`;
      const result: any = await _executeSql(sql, [idDemandeInscription, idUtilisateur]);
      resolve(Boolean(result?.affectedRows));
    } catch (error) {
      reject(error);
    }
  });
};

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
      const doublon = (await recupMembreDoublon(data.idUtilisateur, data.contactMembre, data.dateNaissMembre))
        || (await recupMembreDoublonByIdentity(data.idUtilisateur, data.nomMembre, data.prenomMembre, data.contactMembre));
      if (doublon) {
        reject(new Error('Ce membre a deja ete enregistre.'));
        return;
      }

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
      const sql = 'SELECT * FROM membre WHERE COALESCE(estDecede, 0) <> 1 ORDER BY idMembre ASC;';
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
      const sql = 'SELECT * FROM membre WHERE idUtilisateur = ? AND COALESCE(estDecede, 0) <> 1;';
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
      const doublon = (await recupMembreDoublon(
        data.idUtilisateur,
        data.contactMembre,
        data.dateNaissMembre,
        data.idMembre
      )) || (await recupMembreDoublonByIdentity(
        data.idUtilisateur,
        data.nomMembre,
        data.prenomMembre,
        data.contactMembre,
        data.idMembre
      ));

      if (doublon) {
        reject(new Error('Ce membre a deja ete enregistre.'));
        return;
      }

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
  ajouterDemandeInscriptionMembre,
  recupDemandesInscriptionMembreByUtilisateur,
  validerDemandeInscriptionMembre,
  rejeterDemandeInscriptionMembre,
};
