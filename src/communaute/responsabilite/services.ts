import functions from "./functions";
import {  IResponsable, } from "./interfaces";

/**
 * 
Permet d'ajouter un responsabilite
 * @returns 
 */
const ajouterResponsabilite = (data: IResponsable) => {
    return new Promise(async (resolve, reject) => {
        try {
            const idResponsabilite: any = await functions.ajouterResponsabilite({...data})
            const responsabilite = await functions.recupResponsabiliteById(idResponsabilite)
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

const supprimerResponsabilite = (idResponsabilite: number) => {
    return new Promise(async (resolve, reject) => {
      try {
        const responsabilites = await functions.recupResponsabilite()
        if (Array.isArray(responsabilites)) {
          const index = responsabilites.findIndex((item) => item.idResponsabilite === idResponsabilite)
          if (index >= 0) {
            responsabilites.splice(index, 1)
            await functions.supprimerResponsabilite(idResponsabilite)
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
  
const modifierResponsabilite = (data: IResponsable) => {
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

