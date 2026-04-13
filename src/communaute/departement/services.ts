import functions from "./functions";
import { IDepartement, } from "./interfaces";
import functions_utilisateur from "../utlisateur/functions";


const ajouterDepartement = (data: IDepartement) => {
  return new Promise(async (resolve, reject) => {
    try {
      const idDepartement: any = await functions.ajouterDepartement({ ...data });
      const departement = await functions.recupDepartementById(idDepartement);
      const departementItem = Array.isArray(departement) ? departement[0] : departement;
      resolve(departementItem);
    } catch (error) {
      reject(error);
    }
  });
};


const recupDepartement = () => {
  return new Promise(async (resolve, reject) => {
    try {
      // const utilisateur: any = await functions_utilisateur.recupUtilisateurById(idUtilisateur)
      const departements = await functions.recupDepartement()
      resolve(departements)
    } catch (error) {
      reject(error);
    }
  });
};

const recupDepartementByIdUtilsateur = (idUtilisateur: any) => {
  return new Promise(async (resolve, reject) => {
      try {
          const departementByUtilisateur = await functions.recupDepartementByIdUtilsateur(idUtilisateur)
          resolve(departementByUtilisateur)
      } catch (error) {
          console.log("Erreur service departement :", error)
          reject(error);
      }
  });
};

const supprimerDepartement = (idDepartement: number, idUtilisateur: number) => {
  return new Promise(async (resolve, reject) => {
    try {
      await functions.supprimerDepartement(idDepartement, idUtilisateur)
      resolve({idDepartement:idDepartement})
    } catch (error) {
      reject(error)
    }
  })
}

const modifierDepartement = (data: IDepartement) => {
  return new Promise(async (resolve, reject) => {
    try {
      await functions.modifierDepartement(data)
      resolve(data)
    } catch (error) {
      reject(error)
    }
  })
}

export default {
  ajouterDepartement,
  recupDepartement,
  supprimerDepartement,
  modifierDepartement,
  recupDepartementByIdUtilsateur
}


