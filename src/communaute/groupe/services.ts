import functions from "./functions";
import { IGroupe } from "./interfaces";

/**
 * Permet d'ajouter un groupe.
 */
const ajouterGroupe = (data: IGroupe) => {
  return new Promise(async (resolve, reject) => {
    try {
      const idGroupe: any = await functions.ajouterGroupe({ ...data });
      const groupe = await functions.recupGroupeId(idGroupe);
      resolve(groupe);
    } catch (error) {
      reject(error);
    }
  });
};

const recupGroupe = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const groupes = await functions.recupGroupe();
      resolve(groupes);
    } catch (error) {
      reject(error);
    }
  });
};

const recupGroupeByIdUtilsateur = (idUtilisateur: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      const groupeByUtilisateur = await functions.recupGroupeByIdUtilsateur(idUtilisateur);
      resolve(groupeByUtilisateur);
    } catch (error) {
      reject(error);
    }
  });
};

const supprimerGroupe = (idGroupe: number, idUtilisateur?: number) => {
  return new Promise(async (resolve, reject) => {
    try {
      await functions.supprimerGroupe(idGroupe, idUtilisateur);
      resolve({ idGroupe });
    } catch (error) {
      reject(error);
    }
  });
};

const modifierGroupe = (data: IGroupe) => {
  return new Promise(async (resolve, reject) => {
    try {
      await functions.modifierGroupe(data);
      resolve(data);
    } catch (error) {
      reject(error);
    }
  });
};

export default {
  ajouterGroupe,
  recupGroupe,
  supprimerGroupe,
  modifierGroupe,
  recupGroupeByIdUtilsateur,
};
