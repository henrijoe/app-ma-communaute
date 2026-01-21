import functions from "./functions";
import {INiveau_etude} from "./interfaces";
const path = require('path');
const fs = require("fs");


const obtenirIdNiveauEtude = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const niveau = await functions.obtenirIdNiveauEtude()
            resolve(niveau)
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * 
Permet d'ajouter un niveau
 * @returns 
 */
const ajouterNiveauEtude = (data: INiveau_etude) => {
    return new Promise(async (resolve, reject) => {
        try {
            const idNiveau: any = await functions.ajouterNiveauEtude({...data})
            const niveau = await functions.obtenirIdNiveauEtudeById(idNiveau)
            resolve(niveau)
        } catch (error) {
            reject(error);
        }
    });
};

const supprimerNiveau = (idNiveauEtude: number) => {
    return new Promise(async (resolve, reject) => {
      try {
        const niveaux = await functions.obtenirIdNiveauEtude()
        if (Array.isArray(niveaux)) {
          const index = niveaux.findIndex((item) => item.idNiveauEtude === idNiveauEtude)
          if (index >= 0) {
            niveaux.splice(index, 1)
            await functions.supprimerNiveau(idNiveauEtude)
            resolve(true)
          } else {
            return reject('niveau non trouvé')
          }
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  const modifierNiveau = (data: INiveau_etude) => {
    return new Promise(async (resolve, reject) => {
      try {
        await functions.modifierNiveau(data)
        resolve(data)
      } catch (error) {
        reject(error)
      }
    })
  }

export default {
    obtenirIdNiveauEtude,
    ajouterNiveauEtude,
    supprimerNiveau,
    modifierNiveau
}

