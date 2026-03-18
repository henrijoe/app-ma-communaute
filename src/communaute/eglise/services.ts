import functions from "./functions";
import { IEglise } from "./interfaces";

/**
 * Permet d'ajouter une eglise.
 */
const ajouterEglise = (data: IEglise) => {
  return new Promise(async (resolve, reject) => {
    try {
      const idEglise: any = await functions.ajouterEglise({ ...data });
      const eglise = await functions.recupEgliseById(idEglise);
      resolve(eglise);
    } catch (error) {
      reject(error);
    }
  });
};

const recupEglise = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const eglises = await functions.recupEglise();
      resolve(eglises);
    } catch (error) {
      reject(error);
    }
  });
};

// Renvoie l'eglise de l'utilisateur connecte.
const recupEgliseByUtilisateur = (idUtilisateur: number) => {
  return new Promise(async (resolve, reject) => {
    try {
      const eglise = await functions.recupEgliseByUtilisateur(idUtilisateur);
      resolve(eglise);
    } catch (error) {
      reject(error);
    }
  });
};

const supprimerEglise = (idEglise: number, idUtilisateur?: number) => {
  return new Promise(async (resolve, reject) => {
    try {
      await functions.supprimerEglise(idEglise, idUtilisateur);
      resolve({ idEglise });
    } catch (error) {
      reject(error);
    }
  });
};

const modifierEglise = (data: IEglise) => {
  return new Promise(async (resolve, reject) => {
    try {
      await functions.modifierEglise(data);
      resolve(data);
    } catch (error) {
      reject(error);
    }
  });
};

export default {
  ajouterEglise,
  recupEglise,
  recupEgliseByUtilisateur,
  supprimerEglise,
  modifierEglise,
};
