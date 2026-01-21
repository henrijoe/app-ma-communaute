import functions from "./functions";
import {GroupeResponse, IGroupe} from "./interfaces";

/**
 * 
Permet d'ajouter une groupe
 * @returns 
 */
const ajouterGroupe = (data: IGroupe) => {
  return new Promise(async (resolve, reject) => {
    try {
      const idGroupe: any = await functions.ajouterGroupe({ ...data })
      const groupe = await functions.recupGroupeId(idGroupe)
      // console.log("🚀 ~ returnnewPromise ~ groupe:", groupe)
      resolve(groupe)
    } catch (error) {
      reject(error);
    }
  });
};

const recupGroupe = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const groupes = await functions.recupGroupe()
      resolve(groupes)
    } catch (error) {
      reject(error);
    }
  });
};

const recupGroupeByIdUtilsateur = (idUtilisateur: any) => {
  return new Promise(async (resolve, reject) => {
      try {
          const groupeByUtilisateur = await functions.recupGroupeByIdUtilsateur(idUtilisateur)
          resolve(groupeByUtilisateur)
      } catch (error) {
          console.log("🚀 ~ file: services.ts:830 ~ returnnewPromise ~ error:", error)
          reject(error);
      }
  });
};


// const recupGroupeByIdUtilsateur = (idUtilisateur: any) => {
//   return new Promise<GroupeResponse>(async (resolve, reject) => {
//       try {
//           const groupeByUtilisateur: GroupeResponse = await functions.recupGroupeByIdUtilsateur(idUtilisateur);
//           if (groupeByUtilisateur.status !== 1) {
//               return reject(groupeByUtilisateur.error);
//           }
//           resolve(groupeByUtilisateur.data);
//       } catch (error) {
//           console.log("🚀 ~ file: services.ts:830 ~ returnnewPromise ~ error:", error);
//           reject(error);
//       }
//   });
// }


const supprimerGroupe = (idGroupe: number) => {
  return new Promise(async (resolve, reject) => {
    try {
      await functions.supprimerGroupe(idGroupe)
      resolve({idGroupe:idGroupe})
    } catch (error) {
      reject(error)
    }
  })
}

const modifierGroupe = (data: IGroupe) => {
  return new Promise(async (resolve, reject) => {
    try {
      await functions.modifierGroupe(data)
      resolve(data)
    } catch (error) {
      reject(error)
    }
  })
}

export default {
  ajouterGroupe,
  recupGroupe,
  supprimerGroupe,
  modifierGroupe,
  recupGroupeByIdUtilsateur
  
}

