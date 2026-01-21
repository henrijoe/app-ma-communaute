import functions from "./functions";
import {  IComptabilite, } from "./interfaces";

/**
 * 
Permet d'ajouter une comptabilite
 * @returns 
 */
const ajouterComptablilite = (data: IComptabilite) => {
    return new Promise(async (resolve, reject) => {
        try {
            const comptabiliteId: any = await functions.ajouterComptablilite({...data})
            const comptabilite = await functions.recupComptabiliteById(comptabiliteId)
            console.log("🚀 ~ file: services.ts:14 ~ returnnewPromise ~ comptabilite:", comptabilite)
            resolve(comptabilite)
        } catch (error) {
            reject(error);
        }
    });
};

const recupComptabilite = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const comptabilites = await functions.recupComptabilite()
            resolve(comptabilites)
        } catch (error) {
            reject(error);
        }
    });
};
  
const supprimerComptabilite = (idComptabilite:number) => {
return new Promise(async(resolve, reject) => {
  try {
    await functions.supprimerComptabilite(idComptabilite)
    resolve({idCellule:idComptabilite})
  } catch (error) {
    reject(error)
  }
})
}

const modifierComptabilite = (data: IComptabilite) => {
    return new Promise(async (resolve, reject) => {
      try {
        await functions.modifierComptabilite(data)
        resolve(data)
      } catch (error) {
        reject(error)
      }
    })
  }
  
export default {
  ajouterComptablilite,
    recupComptabilite,
    supprimerComptabilite,
    modifierComptabilite,
}

