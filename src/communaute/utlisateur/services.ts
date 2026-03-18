import { _executeSql, _selectSql } from "../../db";
import sqliteDB from "../../db/sqliteDB";
import {
  DESKTOP_SUPERADMIN_PASSWORD,
  DESKTOP_SUPERADMIN_USERNAME,
} from "../../db/sqliteSecurity";
import desktopControlServices from "../desktop-control/services";
import functions from "./functions";
import { ICreateCommunauteDatabasePayload, IUtilisateur } from "./interfaces";
import sqlite from "./sqlite";
// import generatePassword from "password-generator";

const path = require('path');
const fs = require("fs");

const bcrypt = require('bcrypt');


/**
 * 
Permet d'ajouter un utilisateur
 * @returns 
 */
const ajouterUtilisateur = (data: IUtilisateur) => {
    console.log("🚀 ~ file: services.ts:13 ~ ajouterUtilisateur ~ data:", data)
    return new Promise(async (resolve, reject) => {
        try {
            // Initialise la licence locale des la creation d'un compte pour demarrer le compteur de 40 jours.
            await desktopControlServices.ensureDesktopLicenseInitialized(data.nomUtilisateur);

            if (sqliteDB.isSqliteMode()) {
              await sqlite.createCommunauteDatabase({
                idUtilisateur: 0,
                nomTemple: data.nomTemple,
                nomEglise: data.nomTemple,
                dossierBase: process.env.SQLITE_DB_DIR,
              })
            }

            const idUtilisateur: any = await functions.ajouterUtilisateur({...data})
            if (sqliteDB.isSqliteMode()) {
              await sqlite.createCommunauteDatabase({
                idUtilisateur: Number(idUtilisateur),
                nomTemple: data.nomTemple,
                nomEglise: data.nomTemple,
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
            return reject('utilisateur non trouvé')
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
        await functions.modifierUtilisateur(data)
        resolve(data)
      } catch (error) {
        reject(error)
      }
    })
  }

  // Old fonction 
//   const connexionUtilisateur = (nomUtilisateur: string, motDePasse: string) => {
//     return new Promise(async (resolve, reject) => {
//       try {
//         // Récupérer l'utilisateur par son nom d'utilisateur depuis la base de données
//         const utilisateur = await _selectSql(`SELECT * FROM utilisateur WHERE nomUtilisateur = ?`, [nomUtilisateur]);
  
//         // Vérifier si l'utilisateur existe et si le mot de passe est valide
//         if (utilisateur && utilisateur.length > 0) {
//           const isValidPassword = await bcrypt.compare(motDePasse, utilisateur[0].password);
//           if (isValidPassword) {
//             resolve(utilisateur[0]); // Renvoyer l'utilisateur s'il est authentifié avec succès
//           } else {
//             reject('Mot de passe incorrect'); // Renvoyer une erreur si le mot de passe est incorrect
//           }
//         } else {
//           reject('Utilisateur non trouvé'); // Renvoyer une erreur si l'utilisateur n'est pas trouvé
//         }
//       } catch (error) {
//         reject(error); // Renvoyer une erreur en cas d'échec de la requête SQL
//       }
//     });
//   };
// // 


// const connexionUtilisateur = async (nomUtilisateur: string, motDePasse: string) => {
//   try {
//       // Utilisez des paramètres sécurisés dans la requête SQL
//       const utilisateur = await _selectSql(`SELECT * FROM utilisateur WHERE nomUtilisateur = ?`, [nomUtilisateur]);

//       // Gérez le cas où l'utilisateur n'est pas trouvé
//       if (!utilisateur || utilisateur.length === 0) {
//           throw new Error('Utilisateur non trouvé');
//       }

//       // Vérifiez le mot de passe en utilisant bcrypt.compare
//       const isValidPassword = await bcrypt.compare(motDePasse, utilisateur[0].password);
//       console.log("🚀 ~ connexionUtilisateur ~ isValidPassword:", isValidPassword)

//       // Renvoyez l'utilisateur s'il est authentifié avec succès
//       if (isValidPassword) {
//           return utilisateur[0];
//       } else {
//           throw new Error('Mot de passe incorrect');
//       }
//   } catch (error) {
//       // Gérez les erreurs et renvoyez des messages d'erreur appropriés
//       throw new Error(`Erreur lors de la connexion de l'utilisateur : ${error.message}`);
//   }
// };
  

  const connexionUtilisateur = async (nomUtilisateur: string, motDePasse: string) => {
    try {
        // Utilisez des paramètres sécurisés dans la requête SQL
        const utilisateur = await _selectSql(`SELECT * FROM utilisateur WHERE nomUtilisateur = ?`, [nomUtilisateur]);
  
        // console.log("🚀 ~ connexionUtilisateur ~ utilisateur+++++:", utilisateur)
        // Gérez le cas où l'utilisateur n'est pas trouvé
        if (!utilisateur || utilisateur.length === 0) {
            throw new Error('Utilisateur non trouvé');
        }
        // Vérifiez le mot de passe en utilisant bcrypt.compare
        const isValidPassword = await bcrypt.compare(motDePasse, utilisateur[0].password); 
        console.log("🚀 ~ connexionUtilisateur ~ isValidPassword-----:", isValidPassword)
  
        // Renvoyez l'utilisateur s'il est authentifié avec succès
        if (!isValidPassword) {
            return utilisateur[0];
        } else {
            throw new Error('Mot de passe incorrect');
        }
    } catch (error:any) {
        // Gérez les erreurs et renvoyez des messages d'erreur appropriés
        throw new Error(`Erreur lors de la connexion de l'utilisateur : ${error.message}`);
    }
  };
  

const login = (data: IUtilisateur) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Le superadmin fixe peut toujours se connecter pour debloquer le desktop local.
      if (
        desktopControlServices.isFixedDesktopSuperAdminCredentials(
          data.nomUtilisateur,
          data.password
        )
      ) {
        resolve({
          idUtilisateur: 0,
          logoUtilisateur: '',
          nomTemple: 'Super Administration Desktop',
          nomUtilisateur: DESKTOP_SUPERADMIN_USERNAME,
          prenomUtilisateur: 'Superadmin',
          telephoneUtilisateur: '',
          password: DESKTOP_SUPERADMIN_PASSWORD,
          confirmPassword: DESKTOP_SUPERADMIN_PASSWORD,
          email: '',
        });
        return;
      }

      const desktopLicenseStatus = await desktopControlServices.getDesktopLicenseStatus(
        data.nomUtilisateur
      );

      // Si la licence desktop est bloquee, seul le superadmin peut continuer.
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
      // const personnel = await functions.recupUtilisateurById(utilisateur.idUtilisateur)
      const res = {
        ...utilisateur
      }
      // console.log("🚀 ~ returnnewPromise ~ res:", res)
      resolve(res);
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
  {
    idUtilisateur: number;
    logoUtilisateur:string
    nomTemple: string;
    nomUtilisateur: string;
    prenomUtilisateur: string;
    telephoneUtilisateur: string;
    password: string;
    confirmPassword: string;
  }
> => {
  return new Promise(async (resolve, reject) => {
    try {
      // console.log("🚀 ~ file: services.ts:93 ~ data", data.idUtilisateur)
      const utilisateur = await functions.recupUtilisateurById(data.idUtilisateur);
      // console.log("🚀 ~ file: services.ts:108 ~ returnnewPromise ~ utilisateur", utilisateur)
      if (!utilisateur) {
        return reject({message: "Une erreur s'est produite"})
      }
      // const mdpInitial = generatePassword(6, false);
      // const mdp = bcrypt.hashSync(mdpInitial.trim(), 12);

      const res = await functions.modifierLogin(data.idUtilisateur,data.nomUtilisateur,data.confirmPassword);
      // console.log("🚀 ~ file: services.ts:117 ~ returnnewPromise ~ res", res)

      if (res) {
        const resultat:any = await functions.recupUtilisateurById(data.idUtilisateur);
        resolve(resultat[0])
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
