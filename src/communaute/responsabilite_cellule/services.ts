import functions from "./functions";
import {  IResponsables } from "./interfaces";

/**
 * 
Permet d'ajouter un responsabilite
 * @returns 
 */
const ajouterResponsabilite = (data: IResponsables) => {
    return new Promise(async (resolve, reject) => {
        try {
            const idMembre: any = await functions.ajouterResponsabilite({...data})
            const responsabilite = await functions.recupResponsabiliteById(idMembre)
            resolve(responsabilite)
        } catch (error) {
            reject(error);
        }
    });
};

const recupResponsabilite = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const responsabilites = await functions.recupResponsabilite()
            resolve(responsabilites)
        } catch (error) {
            reject(error);
        }
    });
};

const supprimerResponsabilite = (idMembre: number) => {
    return new Promise(async (resolve, reject) => {
      try {
        const responsabilites = await functions.recupResponsabilite()
        if (Array.isArray(responsabilites)) {
          const index = responsabilites.findIndex((item) => item.idMembre === idMembre)
          if (index >= 0) {
            responsabilites.splice(index, 1)
            await functions.supprimerResponsabilite(idMembre)
            resolve(true)
          } else {
            return reject('Departement non trouvé')
          }
        }
      } catch (error) {
        reject(error)
      }
    })
  }
  
const modifierResponsabilite = (data: IResponsables) => {
    return new Promise(async (resolve, reject) => {
      try {
        await functions.modifierResponsabilite(data)
        resolve(data)
      } catch (error) {
        reject(error)
      }
    })
  }
  
export default {
    ajouterResponsabilite,
    recupResponsabilite,
    supprimerResponsabilite,
    modifierResponsabilite
}

