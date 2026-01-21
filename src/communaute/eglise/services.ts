import functions from "./functions";
import {IEglise,} from "./interfaces";

/**
 * 
Permet d'ajouter une cellule
 * @returns 
 */
const ajouterEglise = (data: IEglise) => {
  return new Promise(async (resolve, reject) => {
    try {
      const idEglise: any = await functions.ajouterEglise({ ...data })
      const eglise = await functions.recupEgliseById(idEglise)
      console.log("🚀 ~ file: services.ts:14 ~ returnnewPromise ~ eglise:", eglise)
      resolve(eglise)
    } catch (error) {
      reject(error);
    }
  });
};


const recupEglise = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const eglises = await functions.recupEglise()
      resolve(eglises)
    } catch (error) {
      reject(error);
    }
  });
};

const supprimerEglise = (idEglise: number) => {
  return new Promise(async (resolve, reject) => {
    try {
      await functions.supprimerEglise(idEglise)
      resolve({ idEglise: idEglise })
    } catch (error) {
      reject(error)
    }
  })
}

const modifierEglise = (data: IEglise) => {
  return new Promise(async (resolve, reject) => {
    try {
      await functions.modifierEglise(data)
      resolve(data)
    } catch (error) {
      reject(error)
    }
  })
}

export default {
  ajouterEglise,
  recupEglise,
  supprimerEglise,
  modifierEglise,
}

