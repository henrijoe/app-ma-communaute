import functions from "./functions";
import {  INouvelleAme, } from "./interfaces";

/**
 * 
Permet d'ajouter une ame
 * @returns 
 */
const ajouterNouvelleAme = (data: INouvelleAme) => {
    console.log("🚀 ~ file: services.ts:10 ~ ajouterNouvelleAme ~ data:", data)
    return new Promise(async (resolve, reject) => {
        try {
            const idNouvelleAme: any = await functions.ajouterNouvelleAme({...data})
            const nouvelleAme = await functions.recupNouvelleAmeById(idNouvelleAme)
            resolve(nouvelleAme)
        } catch (error) {
            reject(error);
        }
    });
};

const recupNouvelleAme = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const nouvelleAmes = await functions.recupNouvelleAme()
            resolve(nouvelleAmes)
        } catch (error) {
            reject(error);
        }
    });
};

const supprimerNouvelleAme = (idNouvelleAme: number) => {
    return new Promise(async (resolve, reject) => {
      try {
        const nouvelleAme = await functions.recupNouvelleAme()
        if (Array.isArray(nouvelleAme)) {
          const index = nouvelleAme.findIndex((item) => item.idNouvelleAme === idNouvelleAme)
          if (index >= 0) {
            nouvelleAme.splice(index, 1)
            await functions.supprimerNouvelleAme(idNouvelleAme)
            resolve(true)
          } else {
            return reject('personne non trouvé')
          }
        }
      } catch (error) {
        reject(error)
      }
    })
  }
  

const modifierNouvelleAme = (data: INouvelleAme) => {
    return new Promise(async (resolve, reject) => {
      try {
        await functions.modifierNouvelleAme(data)
        console.log("🚀 ~ file: services.ts:58 ~ returnnewPromise ~ data+++++:", data)
        resolve(data)
      } catch (error) {
        reject(error)
      }
    })
  }
  
export default {
  ajouterNouvelleAme,
    recupNouvelleAme,
    supprimerNouvelleAme,
    modifierNouvelleAme,
}

