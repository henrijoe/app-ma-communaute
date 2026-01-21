import functions from "./functions";
import { IMariage} from "./interfaces";

/**
 * 
Permet d'ajouter une mariage
 * @returns 
 */
const ajouterMariage = (data: IMariage) => {
  console.log("🚀 ~ ajouterMariage ~ data:", data)
  return new Promise(async (resolve, reject) => {
    try {
      const idMariage: any = await functions.ajouterMariage({ ...data })
      const mariage = await functions.recupMariageId(idMariage)
      resolve(mariage)
    } catch (error) {
      reject(error);
    }
  });
};

const recupMariage = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const mariages = await functions.recupMariage()
      resolve(mariages)
    } catch (error) {
      reject(error);
    }
  });
};

// 
const recupMariageByIdUtilsateur = (idUtilisateur: any) => {
  return new Promise(async (resolve, reject) => {
      try {
          const membereByUtilisateur = await functions.recupMariageByIdUtilsateur(idUtilisateur)
          resolve(membereByUtilisateur)
      } catch (error) {
          console.log("🚀 ~ file: services.ts:830 ~ returnnewPromise ~ error:", error)
          reject(error);
      }
  });
};


const supprimerMariage = (idMariage: number) => {
  return new Promise(async (resolve, reject) => {
    try {
      await functions.supprimerMariage(idMariage)
      resolve({idMariage:idMariage})
    } catch (error) {
      reject(error)
    }
  })
}


const modifierMariage = (data: IMariage) => {
  return new Promise(async (resolve, reject) => {
    try {
      await functions.modifierMariage(data)
      resolve(data)
    } catch (error) {
      reject(error)
    }
  })
}

export default {
  ajouterMariage,
  recupMariage,
  supprimerMariage,
  modifierMariage,
  recupMariageByIdUtilsateur
}

