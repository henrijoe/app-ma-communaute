import { _selectSql } from '../../db';
import sqliteDB from '../../db/sqliteDB';
import {
  DESKTOP_SUPERADMIN_PASSWORD,
  DESKTOP_SUPERADMIN_USERNAME,
} from '../../db/sqliteSecurity';
import { getChurchLogoPath, saveFileToBase64 } from '../functions';
import desktopControlServices from '../desktop-control/services';
import { createLocalSessionToken } from '../auth';
import functions from './functions';
import { ICreateCommunauteDatabasePayload, IUtilisateur } from './interfaces';
import sqlite from './sqlite';
import { isSmtpConfigured, sendSmtpMail } from '../../utils/smtpMailer';

const bcrypt = require('bcrypt');

const ALL_MODULE_PERMISSIONS = JSON.stringify([
  'dashboard',
  'user',
  'culte',
  'departement',
  'cellule',
  'groupe',
  'social',
  'galerie',
  'agenda',
  'comptabilite',
  'settings',
]);

const PASSWORD_RESET_GENERIC_MESSAGE =
  'Si ce compte existe, un code de reinitialisation a ete envoye par email.';

const PASSWORD_RESET_EXPIRATION_MINUTES = 15;

const normalizeUtilisateurData = (data: Partial<IUtilisateur>): IUtilisateur => ({
  idUtilisateur: Number(data.idUtilisateur || 0),
  idUtilisateurParent: data.idUtilisateurParent ? Number(data.idUtilisateurParent) : null,
  roleUtilisateur:
    data.roleUtilisateur === 'gestionnaire' || data.roleUtilisateur === 'lecteur'
      ? data.roleUtilisateur
      : 'admin',
  permissionsUtilisateur: data.permissionsUtilisateur || ALL_MODULE_PERMISSIONS,
  actifUtilisateur: Number(data.actifUtilisateur || 1),
  logoUtilisateur: data.logoUtilisateur || '',
  logoEglise: data.logoEglise || '',
  nomTemple: data.nomTemple || '',
  nomEgliseCourt: data.nomEgliseCourt || '',
  lieuEglise: data.lieuEglise || '',
  nomUtilisateur: data.nomUtilisateur || '',
  prenomUtilisateur: data.prenomUtilisateur || '',
  telephoneUtilisateur: data.telephoneUtilisateur || '',
  telephoneSecretariatEglise: data.telephoneSecretariatEglise || '',
  pasteurPrincipal: data.pasteurPrincipal || '',
  pasteurSecondaire: data.pasteurSecondaire || '',
  pasteurTroisieme: data.pasteurTroisieme || '',
  telephonePasteurPrincipal: data.telephonePasteurPrincipal || '',
  telephonePasteurSecondaire: data.telephonePasteurSecondaire || '',
  telephonePasteurTroisieme: data.telephonePasteurTroisieme || '',
  capaciteAccueilEglise: data.capaciteAccueilEglise || '',
  nombreCultesDimanche: data.nombreCultesDimanche || '',
  emailEglise: data.emailEglise || '',
  boitePostaleEglise: data.boitePostaleEglise || '',
  dateCreationEglise: data.dateCreationEglise || '',
  nombrePasteursEglise: data.nombrePasteursEglise || '',
  nombreAnciensEglise: data.nombreAnciensEglise || '',
  nombreDiacresEglise: data.nombreDiacresEglise || '',
  modeVersetDashboard:
    data.modeVersetDashboard === 'disabled' || data.modeVersetDashboard === 'custom'
      ? data.modeVersetDashboard
      : 'daily',
  versetDashboardReference: data.versetDashboardReference || '',
  versetDashboardTexte: data.versetDashboardTexte || '',
  password: data.password || '',
  confirmPassword: data.confirmPassword || '',
  email: data.email || '',
});

const sanitizeUtilisateurData = <T>(data: T): T => {
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeUtilisateurData(item)) as T;
  }

  if (!data || typeof data !== 'object') {
    return data;
  }

  const { password, confirmPassword, ...safeData } = data as Record<string, any>;
  return safeData as T;
};

const generatePasswordResetCode = (): string =>
  String(Math.floor(100000 + Math.random() * 900000));

const normalizeResetField = (value: unknown): string => String(value || '').trim();

const requestPasswordReset = (data: { nomUtilisateur?: string; email?: string }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const nomUtilisateur = normalizeResetField(data.nomUtilisateur);
      const email = normalizeResetField(data.email).toLowerCase();

      if (!nomUtilisateur || !email) {
        reject(new Error("Le nom utilisateur et l'email sont requis."));
        return;
      }

      const utilisateurRows: any = await functions.recupUtilisateurForPasswordReset(nomUtilisateur, email);
      const utilisateur = Array.isArray(utilisateurRows) ? utilisateurRows[0] : null;

      if (!utilisateur) {
        resolve({ message: PASSWORD_RESET_GENERIC_MESSAGE });
        return;
      }

      if (!isSmtpConfigured()) {
        reject(new Error(
          'Le service email de reinitialisation n est pas configure. Renseignez SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD et SMTP_FROM.'
        ));
        return;
      }

      const resetPasswordCode = generatePasswordResetCode();
      const resetPasswordExpiresAt = new Date(
        Date.now() + PASSWORD_RESET_EXPIRATION_MINUTES * 60 * 1000
      ).toISOString();

      await functions.enregistrerResetPasswordCode(
        Number(utilisateur.idUtilisateur),
        resetPasswordCode,
        resetPasswordExpiresAt
      );

      await sendSmtpMail({
        to: email,
        subject: 'Code de reinitialisation du mot de passe',
        text: [
          `Bonjour ${utilisateur.prenomUtilisateur || utilisateur.nomUtilisateur || ''},`,
          '',
          `Votre code de reinitialisation est : ${resetPasswordCode}`,
          `Ce code expire dans ${PASSWORD_RESET_EXPIRATION_MINUTES} minutes.`,
          '',
          "Si vous n'etes pas a l'origine de cette demande, ignorez simplement ce message.",
        ].join('\n'),
      });

      resolve({ message: PASSWORD_RESET_GENERIC_MESSAGE });
    } catch (error) {
      reject(error);
    }
  });
};

const resetPassword = (data: {
  nomUtilisateur?: string;
  email?: string;
  code?: string;
  password?: string;
  confirmPassword?: string;
}) => {
  return new Promise(async (resolve, reject) => {
    try {
      const nomUtilisateur = normalizeResetField(data.nomUtilisateur);
      const email = normalizeResetField(data.email).toLowerCase();
      const code = normalizeResetField(data.code);
      const password = String(data.password || '');
      const confirmPassword = String(data.confirmPassword || '');

      if (!nomUtilisateur || !email || !code || !password || !confirmPassword) {
        reject(new Error('Tous les champs sont requis pour reinitialiser le mot de passe.'));
        return;
      }

      if (password !== confirmPassword) {
        reject(new Error('Les mots de passe ne correspondent pas.'));
        return;
      }

      const utilisateurRows: any = await functions.recupUtilisateurForPasswordReset(nomUtilisateur, email);
      const utilisateur = Array.isArray(utilisateurRows) ? utilisateurRows[0] : null;

      if (!utilisateur) {
        reject(new Error('Code de reinitialisation invalide ou expire.'));
        return;
      }

      const storedCode = normalizeResetField(utilisateur.resetPasswordCode);
      const expiresAt = normalizeResetField(utilisateur.resetPasswordExpiresAt);

      if (!storedCode || storedCode !== code || !expiresAt || new Date(expiresAt).getTime() < Date.now()) {
        reject(new Error('Code de reinitialisation invalide ou expire.'));
        return;
      }

      const hashedConfirmPassword = await bcrypt.hash(confirmPassword, 20);
      await functions.reinitialiserMotDePasseAvecCode(
        Number(utilisateur.idUtilisateur),
        password,
        hashedConfirmPassword
      );

      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};

const ajouterUtilisateur = (data: IUtilisateur) => {
  return new Promise(async (resolve, reject) => {
    try {
      const normalizedData = normalizeUtilisateurData(data);
      const isSecondaryUser = Number(normalizedData.idUtilisateurParent || 0) > 0;

      if (isSecondaryUser) {
        const secondaryCount = await functions.countSecondaryUsersByParentId(Number(normalizedData.idUtilisateurParent));
        if (secondaryCount >= 5) {
          reject(new Error('Le nombre maximal de 5 utilisateurs secondaires a deja ete atteint.'));
          return;
        }
      } else {
        await desktopControlServices.ensureDesktopLicenseInitialized(normalizedData.nomUtilisateur);

        if (sqliteDB.isSqliteMode()) {
          const communityDisplayName = normalizedData.nomEgliseCourt || normalizedData.nomTemple;
          await sqlite.createCommunauteDatabase({
            idUtilisateur: 0,
            nomTemple: communityDisplayName,
            nomEglise: normalizedData.nomTemple,
            dossierBase: process.env.SQLITE_DB_DIR,
          });
        }
      }

      const idUtilisateur: any = await functions.ajouterUtilisateur(normalizedData);

      if (!isSecondaryUser && sqliteDB.isSqliteMode()) {
        const communityDisplayName = normalizedData.nomEgliseCourt || normalizedData.nomTemple;
        await sqlite.createCommunauteDatabase({
          idUtilisateur: Number(idUtilisateur),
          nomTemple: communityDisplayName,
          nomEglise: normalizedData.nomTemple,
          dossierBase: process.env.SQLITE_DB_DIR,
        });
      }

      const utilisateur = await functions.recupUtilisateurById(idUtilisateur);
      resolve(sanitizeUtilisateurData(utilisateur));
    } catch (error) {
      reject(error);
    }
  });
};

const recupUtilisateur = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const utilisateur = await functions.recupUtilisateur();
      resolve(sanitizeUtilisateurData(utilisateur));
    } catch (error) {
      reject(error);
    }
  });
};

const recupUtilisateurByParentId = (idUtilisateurParent: number) => {
  return new Promise(async (resolve, reject) => {
    try {
      const utilisateur = await functions.recupUtilisateurByParentId(idUtilisateurParent);
      resolve(sanitizeUtilisateurData(utilisateur));
    } catch (error) {
      reject(error);
    }
  });
};

const supprimerUtilisateur = (idUtilisateur: number) => {
  return new Promise(async (resolve, reject) => {
    try {
      const utilisateur = await functions.recupUtilisateur();
      if (Array.isArray(utilisateur)) {
        const index = utilisateur.findIndex((item) => item.idUtilisateur === idUtilisateur);
        if (index >= 0) {
          utilisateur.splice(index, 1);
          await functions.supprimerUtilisateur(idUtilisateur);
          resolve(true);
        } else {
          reject('utilisateur non trouve');
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};

const modifierUtilisateur = (data: IUtilisateur) => {
  return new Promise(async (resolve, reject) => {
    try {
      const existingUtilisateur = data.idUtilisateur
        ? await functions.recupUtilisateurById(Number(data.idUtilisateur))
        : [];
      const existingData = Array.isArray(existingUtilisateur) ? existingUtilisateur[0] : null;
      const hasNewPassword = String(data.password || '').trim().length > 0;
      const normalizedData = normalizeUtilisateurData({
        ...data,
        password: hasNewPassword ? data.password : existingData?.password || '',
        confirmPassword: hasNewPassword
          ? data.confirmPassword || data.password
          : existingData?.confirmPassword || existingData?.password || '',
      });
      let logoEgliseFileName = normalizedData.logoEglise;

      if (normalizedData.logoEglise && normalizedData.logoEglise.startsWith('data:image/')) {
        const base64Data = normalizedData.logoEglise.replace(/^data:image\/\w+;base64,/, '');
        logoEgliseFileName = `eglise_${normalizedData.idUtilisateurParent || normalizedData.idUtilisateur}.jpg`;
        const filePath = getChurchLogoPath(logoEgliseFileName);
        await saveFileToBase64(filePath, base64Data);
      }

      await functions.modifierUtilisateur({
        ...normalizedData,
        logoEglise: logoEgliseFileName,
      });

      const utilisateur: any = await functions.recupUtilisateurById(normalizedData.idUtilisateur);
      if (Array.isArray(utilisateur) && utilisateur.length > 0) {
        resolve(sanitizeUtilisateurData(utilisateur[0]));
        return;
      }

      resolve(sanitizeUtilisateurData({
        ...normalizedData,
        logoEglise: logoEgliseFileName,
      }));
    } catch (error) {
      reject(error);
    }
  });
};

const connexionUtilisateur = async (nomUtilisateur: string, motDePasse: string) => {
  try {
    const utilisateur = await _selectSql(`SELECT * FROM utilisateur WHERE nomUtilisateur = ?`, [nomUtilisateur]);

    if (!utilisateur || utilisateur.length === 0) {
      throw new Error('Utilisateur non trouve');
    }
    const isValidPassword = await bcrypt.compare(motDePasse, utilisateur[0].password);

    if (!isValidPassword) {
      return utilisateur[0];
    }

    throw new Error('Mot de passe incorrect');
  } catch (error: any) {
    throw new Error(`Erreur lors de la connexion de l'utilisateur : ${error.message}`);
  }
};

const login = (data: IUtilisateur) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (desktopControlServices.isFixedDesktopSuperAdminCredentials(data.nomUtilisateur, data.password)) {
        const superAdminUser = {
          idUtilisateur: 0,
          idUtilisateurParent: null,
          roleUtilisateur: 'admin',
          permissionsUtilisateur: ALL_MODULE_PERMISSIONS,
          actifUtilisateur: 1,
          logoUtilisateur: '',
          logoEglise: '',
          nomTemple: 'Super Administration Desktop',
          nomEgliseCourt: 'Super Admin',
          lieuEglise: '',
          nomUtilisateur: DESKTOP_SUPERADMIN_USERNAME,
          prenomUtilisateur: 'Superadmin',
          telephoneUtilisateur: '',
          telephoneSecretariatEglise: '',
          pasteurPrincipal: '',
          pasteurSecondaire: '',
          pasteurTroisieme: '',
          telephonePasteurPrincipal: '',
          telephonePasteurSecondaire: '',
          telephonePasteurTroisieme: '',
          capaciteAccueilEglise: '',
          nombreCultesDimanche: '',
          emailEglise: '',
          boitePostaleEglise: '',
          dateCreationEglise: '',
          nombrePasteursEglise: '',
          nombreAnciensEglise: '',
          nombreDiacresEglise: '',
          modeVersetDashboard: 'disabled',
          versetDashboardReference: '',
          versetDashboardTexte: '',
          email: '',
        };

        resolve({
          ...superAdminUser,
          token: createLocalSessionToken(superAdminUser),
        });
        return;
      }

      const desktopLicenseStatus = await desktopControlServices.getDesktopLicenseStatus(data.nomUtilisateur);
      if (desktopLicenseStatus.isBlocked) {
        reject(new Error(desktopLicenseStatus.blockMessage));
        return;
      }

      if (sqliteDB.isSqliteMode()) {
        const databasePath = await sqliteDB.findSqliteDatabaseForLogin(data.nomUtilisateur, data.password);
        if (!databasePath) {
          reject(new Error('Nom Utilisateur ou Mot de passe incorrect !.'));
          return;
        }
      }

      const utilisateur: any = await functions.login(data);
      const safeUtilisateur = sanitizeUtilisateurData({
        ...normalizeUtilisateurData(utilisateur),
        idUtilisateur: Number(utilisateur?.idUtilisateur || 0),
        idUtilisateurParent: utilisateur?.idUtilisateurParent ? Number(utilisateur.idUtilisateurParent) : null,
      });

      resolve({
        ...safeUtilisateur,
        token: createLocalSessionToken(safeUtilisateur),
      });
    } catch (error) {
      reject(error);
    }
  });
};

const creerBaseSqlite = (data: ICreateCommunauteDatabasePayload) => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await sqlite.createCommunauteDatabase(data);
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};

export const modifierMotDePasse = (data: { idUtilisateur: number; nomUtilisateur: string; confirmPassword: string }): Promise<IUtilisateur> => {
  return new Promise(async (resolve, reject) => {
    try {
      const utilisateur = await functions.recupUtilisateurById(data.idUtilisateur);
      if (!utilisateur) {
        reject({ message: "Une erreur s'est produite" });
        return;
      }

      const res = await functions.modifierLogin(data.idUtilisateur, data.nomUtilisateur, data.confirmPassword);

      if (res) {
        const resultat: any = await functions.recupUtilisateurById(data.idUtilisateur);
        resolve(normalizeUtilisateurData(resultat[0]));
      }
    } catch (error) {
      reject(error);
    }
  });
};

export default {
  ajouterUtilisateur,
  recupUtilisateur,
  recupUtilisateurByParentId,
  supprimerUtilisateur,
  modifierUtilisateur,
  requestPasswordReset,
  resetPassword,
  connexionUtilisateur,
  login,
  modifierMotDePasse,
  creerBaseSqlite,
};
