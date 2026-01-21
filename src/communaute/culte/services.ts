import functions from "./functions";
import { ICulte} from "./interfaces";

/**
 * 
Permet d'ajouter une culte
 * @returns 
 */
const ajouterCulte = (data: ICulte) => {
  return new Promise(async (resolve, reject) => {
    try {
      const idCulte: any = await functions.ajouterCulte({ ...data})
      // console.log("🚀 ~ returnnewPromise ~ idCulte:", idCulte)
      const culte = await functions.recupCulteId(idCulte)
      resolve(culte)
    } catch (error) {
      reject(error);
    }
  });
};

const recupCulte = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const cultes = await functions.recupCulte()
      resolve(cultes)
    } catch (error) {
      reject(error);
    }
  });
};

// 
const recupCulteByIdUtilsateur = (idUtilisateur: any) => {
  return new Promise(async (resolve, reject) => {
      try {
          const membereByUtilisateur = await functions.recupCulteByIdUtilsateur(idUtilisateur)
          resolve(membereByUtilisateur)
      } catch (error) {
          console.log("🚀 ~ file: services.ts:830 ~ returnnewPromise ~ error:", error)
          reject(error);
      }
  });
};


const supprimerCulte = (idCulte: number) => {
  return new Promise(async (resolve, reject) => {
    try {
      await functions.supprimerCulte(idCulte)
      resolve({idCulte:idCulte})
    } catch (error) {
      reject(error)
    }
  })
}


const modifierCulte = (data: ICulte) => {
  return new Promise(async (resolve, reject) => {
    try {
      await functions.modifierCulte(data)
      resolve(data)
    } catch (error) {
      reject(error)
    }
  })
}

export default {
  ajouterCulte,
  recupCulte,
  supprimerCulte,
  modifierCulte,
  recupCulteByIdUtilsateur
}

