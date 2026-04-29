import { _selectSql } from "../../db";
import sqliteDB from "../../db/sqliteDB";
import {
  DESKTOP_SUPERADMIN_PASSWORD,
  DESKTOP_SUPERADMIN_USERNAME,
} from "../../db/sqliteSecurity";
import { getChurchLogoPath, saveFileToBase64 } from "../functions";
import desktopControlServices from "../desktop-control/services";
import functions from "./functions";
import { ICreateCommunauteDatabasePayload, IUtilisateur } from "./interfaces";
import sqlite from "./sqlite";

const bcrypt = require('bcrypt');

const normalizeUtilisateurData = (data: Partial<IUtilisateur>): IUtilisateur => ({
  idUtilisateur: Number(data.idUtilisateur || 0),
  logoUtilisateur: data.logoUtilisateur || '',
  logoEglise: data.logoEglise || '',
  nomTemple: data.nomTemple || '',
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
  password: data.password || '',
  confirmPassword: data.confirmPassword || '',
  email: data.email || '',
});

/**
 *
Permet d'ajouter un utilisateur
 * @returns
 */
const ajouterUtilisateur = (data: IUtilisateur) => {
    return new Promise(async (resolve, reject) => {
        try {
            const normalizedData = normalizeUtilisateurData(data);

            // Initialise la licence locale des la creation d'un compte pour demarrer le compteur de 40 jours.
            await desktopControlServices.ensureDesktopLicenseInitialized(normalizedData.nomUtilisateur);

            if (sqliteDB.isSqliteMode()) {
              await sqlite.createCommunauteDatabase({
                idUtilisateur: 0,
                nomTemple: normalizedData.nomTemple,
                nomEglise: normalizedData.nomTemple,
                dossierBase: process.env.SQLITE_DB_DIR,
              })
            }

            const idUtilisateur: any = await functions.ajouterUtilisateur(normalizedData)
            if (sqliteDB.isSqliteMode()) {
              await sqlite.createCommunauteDatabase({
                idUtilisateur: Number(idUtilisateur),
                nomTemple: normalizedData.nomTemple,
                nomEglise: normalizedData.nomTemple,
                dossierBase: process.env.SQLITE_DB_DIR,
              })
            }
            const utilisateur = await functions.recupUtilisateurById(idUtilisateur)
            resolve(utilisateur)
        } catch (error) {
            reject(error);
        }
    });
};

const recupUtilisateur = () => {
  return new Promise(async (resolve, reject) => {
      try {
          const utilisateur = await functions.recupUtilisateur()
          resolve(utilisateur)
      } catch (error) {
          reject(error);
      }
  });
};

const supprimerUtilisateur = (idUtilisateur: number) => {
    return new Promise(async (resolve, reject) => {
      try {
        const utilisateur = await functions.recupUtilisateur()
        if (Array.isArray(utilisateur)) {
          const index = utilisateur.findIndex((item) => item.idUtilisateur === idUtilisateur)
          if (index >= 0) {
            utilisateur.splice(index, 1)
            await functions.supprimerUtilisateur(idUtilisateur)
            resolve(true)
          } else {
            return reject('utilisateur non trouve')
          }
        }
      } catch (error) {
        reject(error)
      }
    })
  }

const modifierUtilisateur = (data: IUtilisateur) => {
  return new Promise(async (resolve, reject) => {
    try {
      const normalizedData = normalizeUtilisateurData(data);
      let logoEgliseFileName = normalizedData.logoEglise;

      if (normalizedData.logoEglise && normalizedData.logoEglise.startsWith('data:image/')) {
        const base64Data = normalizedData.logoEglise.replace(/^data:image\/\w+;base64,/, '');
        logoEgliseFileName = `eglise_${normalizedData.idUtilisateur}.jpg`;
        const filePath = getChurchLogoPath(logoEgliseFileName);
        await saveFileToBase64(filePath, base64Data);
      }

      await functions.modifierUtilisateur({
        ...normalizedData,
        logoEglise: logoEgliseFileName,
      })

      const utilisateur: any = await functions.recupUtilisateurById(normalizedData.idUtilisateur);
      if (Array.isArray(utilisateur) && utilisateur.length > 0) {
        resolve(utilisateur[0])
        return;
      }

      resolve({
        ...normalizedData,
        logoEglise: logoEgliseFileName,
      })
    } catch (error) {
      reject(error)
    }
  })
}

const connexionUtilisateur = async (nomUtilisateur: string, motDePasse: string) => {
    try {
        const utilisateur = await _selectSql(`SELECT * FROM utilisateur WHERE nomUtilisateur = ?`, [nomUtilisateur]);

        if (!utilisateur || utilisateur.length === 0) {
            throw new Error('Utilisateur non trouve');
        }
        const isValidPassword = await bcrypt.compare(motDePasse, utilisateur[0].password);
        console.log("connexionUtilisateur isValidPassword:", isValidPassword)

        if (!isValidPassword) {
            return utilisateur[0];
        } else {
            throw new Error('Mot de passe incorrect');
        }
    } catch (error:any) {
        throw new Error(`Erreur lors de la connexion de l'utilisateur : ${error.message}`);
    }
  };

const login = (data: IUtilisateur) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        desktopControlServices.isFixedDesktopSuperAdminCredentials(
          data.nomUtilisateur,
          data.password
        )
      ) {
        resolve({
          idUtilisateur: 0,
          logoUtilisateur: '',
          logoEglise: '',
          nomTemple: 'Super Administration Desktop',
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
          password: DESKTOP_SUPERADMIN_PASSWORD,
          confirmPassword: DESKTOP_SUPERADMIN_PASSWORD,
          email: '',
        });
        return;
      }

      const desktopLicenseStatus = await desktopControlServices.getDesktopLicenseStatus(
        data.nomUtilisateur
      );

      if (desktopLicenseStatus.isBlocked) {
        reject(new Error(desktopLicenseStatus.blockMessage));
        return;
      }

      if (sqliteDB.isSqliteMode()) {
        const databasePath = await sqliteDB.findSqliteDatabaseForLogin(
          data.nomUtilisateur,
          data.password
        );

        if (!databasePath) {
          reject(new Error('Nom Utilisateur ou Mot de passe incorrect !.'));
          return;
        }
      }

      const utilisateur: any = await functions.login(data);
      resolve({
        ...normalizeUtilisateurData(utilisateur),
        idUtilisateur: Number(utilisateur?.idUtilisateur || 0),
      });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Cree la base SQLite locale d'une communaute sans modifier la logique MySQL existante.
 */
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


export const modifierMotDePasse = (data: { idUtilisateur: number, nomUtilisateur: string, confirmPassword: string }): Promise<
  IUtilisateur
> => {
  return new Promise(async (resolve, reject) => {
    try {
      const utilisateur = await functions.recupUtilisateurById(data.idUtilisateur);
      if (!utilisateur) {
        return reject({message: "Une erreur s'est produite"})
      }

      const res = await functions.modifierLogin(data.idUtilisateur,data.nomUtilisateur,data.confirmPassword);

      if (res) {
        const resultat:any = await functions.recupUtilisateurById(data.idUtilisateur);
        resolve(normalizeUtilisateurData(resultat[0]))
      }
    } catch (error) {
      reject(error);
    }
  })
}

export default {
  ajouterUtilisateur,
    recupUtilisateur,
    supprimerUtilisateur,
    modifierUtilisateur,
    connexionUtilisateur,
    login,
    modifierMotDePasse,
    creerBaseSqlite
}
