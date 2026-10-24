import functions from "./functions";
import { INaissance } from "./interfaces";

/**
 * Permet d'ajouter une naissance.
 */
const ajouterNaissance = (data: INaissance) => {
  return new Promise(async (resolve, reject) => {
    try {
      const idNaissance: any = await functions.ajouterNaissance({ ...data });
      const naissance = await functions.recupNaissanceId(idNaissance);
      resolve(naissance);
    } catch (error) {
      reject(error);
    }
  });
};

const recupNaissance = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const naissances = await functions.recupNaissance();
      resolve(naissances);
    } catch (error) {
      reject(error);
    }
  });
};

const recupNaissanceByIdUtilsateur = (idUtilisateur: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      const naissanceByUtilisateur = await functions.recupNaissanceByIdUtilsateur(idUtilisateur);
      resolve(naissanceByUtilisateur);
    } catch (error) {
      reject(error);
    }
  });
};

const supprimerNaissance = (idNaissance: number, idUtilisateur?: number) => {
  return new Promise(async (resolve, reject) => {
    try {
      await functions.supprimerNaissance(idNaissance, idUtilisateur);
      resolve({ idNaissance });
    } catch (error) {
      reject(error);
    }
  });
};

const modifierNaissance = (data: INaissance) => {
  return new Promise(async (resolve, reject) => {
    try {
      await functions.modifierNaissance(data);
      resolve(data);
    } catch (error) {
      reject(error);
    }
  });
};

export default {
  ajouterNaissance,
  recupNaissance,
  supprimerNaissance,
  modifierNaissance,
  recupNaissanceByIdUtilsateur,
};
