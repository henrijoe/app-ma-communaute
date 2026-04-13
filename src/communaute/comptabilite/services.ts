import functions from './functions';
import { IComptabilite } from './interfaces';

const ajouterComptablilite = (data: IComptabilite) =>
  new Promise(async (resolve, reject) => {
    try {
      const comptabiliteId: any = await functions.ajouterComptablilite({ ...data });
      const comptabilite = await functions.recupComptabiliteById(comptabiliteId);
      resolve(comptabilite);
    } catch (error) {
      reject(error);
    }
  });

const recupComptabilite = () =>
  new Promise(async (resolve, reject) => {
    try {
      const comptabilites = await functions.recupComptabilite();
      resolve(comptabilites);
    } catch (error) {
      reject(error);
    }
  });

const recupComptabiliteByUtilisateur = (idUtilisateur: number) =>
  new Promise(async (resolve, reject) => {
    try {
      const comptabilites = await functions.recupComptabiliteByUtilisateur(idUtilisateur);
      resolve(comptabilites);
    } catch (error) {
      reject(error);
    }
  });

const supprimerComptabilite = (idComptabilite: number) =>
  new Promise(async (resolve, reject) => {
    try {
      await functions.supprimerComptabilite(idComptabilite);
      resolve({ idComptabilite });
    } catch (error) {
      reject(error);
    }
  });

const modifierComptabilite = (data: IComptabilite) =>
  new Promise(async (resolve, reject) => {
    try {
      await functions.modifierComptabilite(data);
      const comptabilite = await functions.recupComptabiliteById(data.idComptabilite);
      resolve(comptabilite);
    } catch (error) {
      reject(error);
    }
  });

export default {
  ajouterComptablilite,
  recupComptabilite,
  recupComptabiliteByUtilisateur,
  supprimerComptabilite,
  modifierComptabilite,
};