import functions from "./functions";
import {IMembre, } from "./interfaces";
import { getAvatarsPath, saveFileToBase64 } from "../functions";

const fs = require("fs");

const resolveMemberPhotoPath = (photoPath: string): string | null => {
  if (!photoPath || photoPath.trim() === '') {
    return null;
  }

  const currentPhotoPath = getAvatarsPath(photoPath);
  if (fs.existsSync(currentPhotoPath)) {
    return currentPhotoPath;
  }


  return null;
};

const ajouterMembre = (data: IMembre) => {
    return new Promise(async (resolve, reject) => {
        try {
            const membreInsere: any = await functions.ajouterMembre(data);
            resolve(membreInsere);
        } catch (error) {
            console.error("Erreur dans services.ajouterMembre:", error);
            reject(error);
        }
    });
};

const getFileToBase64 = (photoPath: string) => {
  return new Promise(async (resolve) => {
    try {
      const resolvedPhotoPath = resolveMemberPhotoPath(photoPath);
      if (!resolvedPhotoPath) {
        resolve('');
        return;
      }

      const base64 = fs.readFileSync(resolvedPhotoPath, 'base64');
      resolve(`data:image/jpeg;base64,${base64}`);
    } catch (err) {
      console.log(`err => getFileToBase64 : `, err);
      resolve('');
    }
  });
};

const recupMembre = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const membres: any = await functions.recupMembre();

      const membresAvecPhotos = await Promise.all(
        membres.map(async (item: any) => {
          const photoMembre = await getFileToBase64(item.photoMembre);
          return {
            ...item,
            photoMembre: photoMembre,
          };
        })
      );

      resolve(membresAvecPhotos);
    } catch (error) {
      reject(error);
    }
  });
};

const recupMembreByIdUtilsateur = (idUtilisateur: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const membereByUtilisateur = await functions.recupMembreByIdUtilsateur(idUtilisateur)
            resolve(membereByUtilisateur)
        } catch (error) {
            console.log("Erreur recupMembreByIdUtilsateur:", error)
            reject(error);
        }
    });
};

const supprimerMembre = (idMembre: number, idUtilisateur?: number | null) => {
  return new Promise(async (resolve, reject) => {
      try {
          await functions.supprimerMembre(idMembre, idUtilisateur);
          resolve({ idMembre: idMembre });
      } catch (error) {
          reject(error);
      }
  });
};

const modifierMembre = (data: IMembre) => {
    return new Promise(async (resolve, reject) => {
        try {
            let photoFileName = data.photoMembre;
            
            if (data.photoMembre && data.photoMembre.startsWith('data:image/')) {
                const base64Data = data.photoMembre.replace(/^data:image\/\w+;base64,/, '');
                photoFileName = `membre_${data.idMembre}.jpg`;
                const filePath = getAvatarsPath(photoFileName);
                await saveFileToBase64(filePath, base64Data);
                
                console.log(`Photo sauvegard�e: ${photoFileName}`);
            }
            
            const updateData: IMembre = {
                ...data,
                photoMembre: photoFileName
            };
            
            await functions.modifierMembre(updateData);
            
            const membreMisAJour: any = await functions.recupMembreById(data.idMembre);
            
            if (Array.isArray(membreMisAJour) && membreMisAJour.length > 0) {
                resolve(membreMisAJour[0]);
            } else {
                reject(new Error("Membre non trouv� apr�s modification"));
            }
        } catch (error) {
            console.error("Erreur dans services.modifierMembre:", error);
            reject(error);
        }
    });
};
  
const ajouterDemandeInscriptionMembre = (data: any) => {
  return functions.ajouterDemandeInscriptionMembre(data);
};

const recupDemandesInscriptionMembreByUtilisateur = (idUtilisateur: number) => {
  return functions.recupDemandesInscriptionMembreByUtilisateur(idUtilisateur);
};

const validerDemandeInscriptionMembre = (idDemandeInscription: number, idUtilisateur: number) => {
  return functions.validerDemandeInscriptionMembre(idDemandeInscription, idUtilisateur);
};

const rejeterDemandeInscriptionMembre = (idDemandeInscription: number, idUtilisateur: number) => {
  return functions.rejeterDemandeInscriptionMembre(idDemandeInscription, idUtilisateur);
};

export default {
    recupMembre,
    ajouterMembre,
    supprimerMembre,
    modifierMembre,
    recupMembreByIdUtilsateur,
    ajouterDemandeInscriptionMembre,
    recupDemandesInscriptionMembreByUtilisateur,
    validerDemandeInscriptionMembre,
    rejeterDemandeInscriptionMembre,
}

