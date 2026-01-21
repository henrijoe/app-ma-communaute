import functions from "./functions";
import { IDeces} from "./interfaces";

/**
 * 
Permet d'ajouter une deces
 * @returns 
 */
const ajouterDeces = (data: IDeces) => {
  console.log("🚀 ~ ajouterDeces ~ data:", data)
  return new Promise(async (resolve, reject) => {
    try {
      const idDeces: any = await functions.ajouterDeces({ ...data})
      const deces = await functions.recupDecesId(idDeces)
      resolve(deces)
    } catch (error) {
      reject(error);
    }
  });
};

const recupDeces = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const decess = await functions.recupDeces()
      resolve(decess)
    } catch (error) {
      reject(error);
    }
  });
};

// 
const recupDecesByIdUtilsateur = (idUtilisateur: any) => {
  return new Promise(async (resolve, reject) => {
      try {
          const membereByUtilisateur = await functions.recupDecesByIdUtilsateur(idUtilisateur)
          resolve(membereByUtilisateur)
      } catch (error) {
          console.log("🚀 ~ file: services.ts:830 ~ returnnewPromise ~ error:", error)
          reject(error);
      }
  });
};


const supprimerDeces = (idDeces: number) => {
  return new Promise(async (resolve, reject) => {
    try {
      await functions.supprimerDeces(idDeces)
      resolve({idDeces:idDeces})
    } catch (error) {
      reject(error)
    }
  })
}


const modifierDeces = (data: IDeces) => {
  return new Promise(async (resolve, reject) => {
    try {
      await functions.modifierDeces(data)
      resolve(data)
    } catch (error) {
      reject(error)
    }
  })
}

export default {
  ajouterDeces,
  recupDeces,
  supprimerDeces,
  modifierDeces,
  recupDecesByIdUtilsateur
}

