import functions from "./functions";
import {IDomaine_activite} from "./interfaces";
const path = require('path');
const fs = require("fs");


const ajouterDomaineActivite = (data: IDomaine_activite) => {
    return new Promise(async (resolve, reject) => {
        try {
            const idDomaineActivite: any = await functions.ajouterDomaineActivite({...data})
            const domaineActivite = await functions.obtenirDomaineActiviteById(idDomaineActivite)
            resolve(domaineActivite)
        } catch (error) {
            reject(error);
        }
    });
};

const obtenirDomaineActivite = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const domaine = await functions.obtenirDomaineActivite()
            resolve(domaine)
        } catch (error) {
            reject(error);
        }
    });
};


const supprimerDomaineActivite = (idDomaineActivite: number) => {
    return new Promise(async (resolve, reject) => {
      try {
        const domaine = await functions.obtenirDomaineActivite()
        if (Array.isArray(domaine)) {
          const index = domaine.findIndex((item) => item.idDomaineActivite === idDomaineActivite)
          if (index >= 0) {
            domaine.splice(index, 1)
            await functions.supprimerDomaineActivite(idDomaineActivite)
            resolve(true)
          } else {
            return reject('Domaine non trouvé')
          }
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  const modifierDomaineActivite = (data: IDomaine_activite) => {
    return new Promise(async (resolve, reject) => {
      try {
        await functions.modifierDomaineActivite(data)
        resolve(data)
      } catch (error) {
        reject(error)
      }
    })
  }

export default {
    ajouterDomaineActivite,
    obtenirDomaineActivite,
    supprimerDomaineActivite,
    modifierDomaineActivite
}

