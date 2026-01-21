import functions from "./functions";
import { INaissance} from "./interfaces";

/**
 * 
Permet d'ajouter une naissance
 * @returns 
 */
const ajouterNaissance = (data: INaissance) => {
  console.log("🚀 ~ ajouterNaissance ~ data:", data)
  return new Promise(async (resolve, reject) => {
    try {
      const idNaissance: any = await functions.ajouterNaissance({ ...data })
      const naissance = await functions.recupNaissanceId(idNaissance)
      resolve(naissance)
    } catch (error) {
      reject(error);
    }
  });
};

const recupNaissance = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const naissances = await functions.recupNaissance()
      resolve(naissances)
    } catch (error) {
      reject(error);
    }
  });
};

// 
const recupNaissanceByIdUtilsateur = (idUtilisateur: any) => {
  return new Promise(async (resolve, reject) => {
      try {
          const membereByUtilisateur = await functions.recupNaissanceByIdUtilsateur(idUtilisateur)
          resolve(membereByUtilisateur)
      } catch (error) {
          console.log("🚀 ~ file: services.ts:830 ~ returnnewPromise ~ error:", error)
          reject(error);
      }
  });
};


const supprimerNaissance = (idNaissance: number) => {
  return new Promise(async (resolve, reject) => {
    try {
      await functions.supprimerNaissance(idNaissance)
      resolve({idNaissance:idNaissance})
    } catch (error) {
      reject(error)
    }
  })
}


const modifierNaissance = (data: INaissance) => {
  return new Promise(async (resolve, reject) => {
    try {
      await functions.modifierNaissance(data)
      resolve(data)
    } catch (error) {
      reject(error)
    }
  })
}

export default {
  ajouterNaissance,
  recupNaissance,
  supprimerNaissance,
  modifierNaissance,
  recupNaissanceByIdUtilsateur
}

