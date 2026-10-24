import functions from "./functions";
import { IMaladie } from "./interfaces";

const ajouterMaladie = (data: IMaladie) => new Promise(async (resolve, reject) => {
  try {
    const idMaladie: any = await functions.ajouterMaladie({ ...data });
    const maladie = await functions.recupMaladieId(idMaladie);
    resolve(maladie);
  } catch (error) {
    reject(error);
  }
});

const recupMaladie = () => new Promise(async (resolve, reject) => {
  try {
    const maladies = await functions.recupMaladie();
    resolve(maladies);
  } catch (error) {
    reject(error);
  }
});

const recupMaladieByIdUtilsateur = (idUtilisateur: any) => new Promise(async (resolve, reject) => {
  try {
    const maladieByUtilisateur = await functions.recupMaladieByIdUtilsateur(idUtilisateur);
    resolve(maladieByUtilisateur);
  } catch (error) {
    reject(error);
  }
});

const supprimerMaladie = (idMaladie: number) => new Promise(async (resolve, reject) => {
  try {
    await functions.supprimerMaladie(idMaladie);
    resolve({ idMaladie });
  } catch (error) {
    reject(error);
  }
});

const modifierMaladie = (data: IMaladie) => new Promise(async (resolve, reject) => {
  try {
    await functions.modifierMaladie(data);
    resolve(data);
  } catch (error) {
    reject(error);
  }
});

export default {
  ajouterMaladie,
  recupMaladie,
  recupMaladieByIdUtilsateur,
  supprimerMaladie,
  modifierMaladie,
};
