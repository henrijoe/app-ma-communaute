import functions from "./functions";
import { ICellule } from "./interfaces";

/**
 * Permet d'ajouter une cellule.
 */
const ajouterCellule = (data: ICellule) => {
  return new Promise(async (resolve, reject) => {
    try {
      const idCellule: any = await functions.ajouterCellule({ ...data });
      const cellule = await functions.recupCelluleId(idCellule);
      resolve(cellule);
    } catch (error) {
      reject(error);
    }
  });
};

const recupCellule = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const cellules = await functions.recupCellule();
      resolve(cellules);
    } catch (error) {
      reject(error);
    }
  });
};

const recupCelluleByIdUtilsateur = (idUtilisateur: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      const celluleByUtilisateur = await functions.recupCelluleByIdUtilsateur(idUtilisateur);
      resolve(celluleByUtilisateur);
    } catch (error) {
      reject(error);
    }
  });
};

const supprimerCellule = (idCellule: number, idUtilisateur?: number) => {
  return new Promise(async (resolve, reject) => {
    try {
      await functions.supprimerCellule(idCellule, idUtilisateur);
      resolve({ idCellule });
    } catch (error) {
      reject(error);
    }
  });
};

const modifierCellule = (data: ICellule) => {
  return new Promise(async (resolve, reject) => {
    try {
      await functions.modifierCellule(data);
      resolve(data);
    } catch (error) {
      reject(error);
    }
  });
};

export default {
  ajouterCellule,
  recupCellule,
  supprimerCellule,
  modifierCellule,
  recupCelluleByIdUtilsateur,
};
