import functions from "./functions";
import { IFamilleJeunesse } from "./interfaces";

const ajouterFamilleJeunesse = (data: IFamilleJeunesse) => {
  return new Promise(async (resolve, reject) => {
    try {
      const idFamilleJeunesse: any = await functions.ajouterFamilleJeunesse({ ...data });
      const famille = await functions.recupFamilleJeunesseId(idFamilleJeunesse);
      resolve(famille);
    } catch (error) {
      reject(error);
    }
  });
};

const recupFamilleJeunesse = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const familles = await functions.recupFamilleJeunesse();
      resolve(familles);
    } catch (error) {
      reject(error);
    }
  });
};

const recupFamilleJeunesseByIdUtilisateur = (idUtilisateur: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      const familles = await functions.recupFamilleJeunesseByIdUtilisateur(Number(idUtilisateur));
      resolve(familles);
    } catch (error) {
      reject(error);
    }
  });
};

const supprimerFamilleJeunesse = (idFamilleJeunesse: number, idUtilisateur?: number) => {
  return new Promise(async (resolve, reject) => {
    try {
      await functions.supprimerFamilleJeunesse(idFamilleJeunesse, idUtilisateur);
      resolve({ idFamilleJeunesse });
    } catch (error) {
      reject(error);
    }
  });
};

const modifierFamilleJeunesse = (data: IFamilleJeunesse) => {
  return new Promise(async (resolve, reject) => {
    try {
      await functions.modifierFamilleJeunesse(data);
      resolve(data);
    } catch (error) {
      reject(error);
    }
  });
};

export default {
  ajouterFamilleJeunesse,
  modifierFamilleJeunesse,
  recupFamilleJeunesse,
  recupFamilleJeunesseByIdUtilisateur,
  supprimerFamilleJeunesse,
};
