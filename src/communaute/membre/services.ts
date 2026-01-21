import functions from "./functions";
import {IMembre, } from "./interfaces";
import { getAvatarsPath, saveFileToBase64 } from "../functions";
import { _executeSql } from "../../db";

const fs = require("fs");
const path = require("path");
const albumDir = path.join(__dirname, '..','..','..', 'albums/');

/**
 * 
Permet d'ajouter un membre
 * @returns 
 */
// const ajouterMembre = (data: IMembre) => {
//     // console.log("🚀 ~ file: services.ts:12 ~ ajouterMembre ~ data:", data)
//     return new Promise(async (resolve, reject) => {
//         try {
//             const idMembre: any = await functions.ajouterMembre({...data})
//             const membre:any = await functions.recupMembreById(idMembre)
//             console.log("🚀 ~ file: services.ts:15 ~ returnnewPromise ~ membre:", membre)
//             resolve(membre[0])
//         } catch (error) {
//             reject(error);
//         }
//     });
// };

// services.ts -
const ajouterMembre = (data: IMembre) => {
    return new Promise(async (resolve, reject) => {
        try {
            // APPEL DIRECT à la fonction CORRECTE dans functions.ts
            // Cette fonction doit gérer elle-même l'insertion et retourner le membre
            const membreInsere: any = await functions.ajouterMembre(data);
            
            // Déjà renvoyé par functions.ajouterMembre
            resolve(membreInsere);
        } catch (error) {
            console.error("Erreur dans services.ajouterMembre:", error);
            reject(error);
        }
    });
};



const getFileToBase64 = (photoPath: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!photoPath || photoPath.trim() === '') {
        resolve('');
        return;
      }
      
      const file = path.join(albumDir, photoPath);
      if (fs.existsSync(file)) {
        const base64 = fs.readFileSync(file, 'base64');
        resolve(`data:image/jpeg;base64,${base64}`);
      } else {
        resolve('');
      }
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

      // Récupérer les photos en base64 pour chaque membre
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

// Recuperer les membres d'une eglise a partir de son utilisateur
const recupMembreByIdUtilsateur = (idUtilisateur: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const membereByUtilisateur = await functions.recupMembreByIdUtilsateur(idUtilisateur)
            resolve(membereByUtilisateur)
        } catch (error) {
            console.log("🚀 ~ file: services.ts:830 ~ returnnewPromise ~ error:", error)
            reject(error);
        }
    });
};


const supprimerMembre = (idMembre: number) => {
  return new Promise(async (resolve, reject) => {
      try {
          // Appelle la fonction pour supprimer un membre
          await functions.supprimerMembre(idMembre);

          // Renvoie l'objet contenant l'id du membre supprimé
          resolve({ idMembre: idMembre });
      } catch (error) {
          // En cas d'erreur, la rejette
          reject(error);
      }
  });
};

// const modifierMembre = (data: IMembre) => {
//     return new Promise(async (resolve, reject) => {
//       try {
//         await functions.modifierMembre(data)
//         resolve(data)
//       } catch (error) {
//         reject(error)
//       }
//     })
//   }

  // Dans services.ts - MODIFIER la fonction modifierMembre
// services.ts - VERSION CORRIGÉE AVEC TYPES
const modifierMembre = (data: IMembre) => {
    return new Promise(async (resolve, reject) => {
        try {
            // 1. Gérer la photo si elle est en base64
            let photoFileName = data.photoMembre;
            
            if (data.photoMembre && data.photoMembre.startsWith('data:image/')) {
                // Extraire la partie base64
                const base64Data = data.photoMembre.replace(/^data:image\/\w+;base64,/, '');
                
                // Générer le nom de fichier
                photoFileName = `membre_${data.idMembre}.jpg`;
                
                // Sauvegarder le fichier
                const filePath = getAvatarsPath(photoFileName);
                await saveFileToBase64(filePath, base64Data);
                
                console.log(`Photo sauvegardée: ${photoFileName}`);
            }
            
            // 2. Préparer les données avec le nom de fichier
            const updateData: IMembre = {
                ...data,
                photoMembre: photoFileName // Remplace le base64 par le nom de fichier
            };
            
            // 3. Appeler la fonction existante de functions.ts
            await functions.modifierMembre(updateData);
            
            // 4. Récupérer le membre mis à jour avec typage explicite
            const membreMisAJour: any = await functions.recupMembreById(data.idMembre);
            
            // Vérifier que le résultat est un tableau
            if (Array.isArray(membreMisAJour) && membreMisAJour.length > 0) {
                resolve(membreMisAJour[0]);
            } else {
                reject(new Error("Membre non trouvé après modification"));
            }
        } catch (error) {
            console.error("Erreur dans services.modifierMembre:", error);
            reject(error);
        }
    });
};
  
export default {
    recupMembre,
    ajouterMembre,
    supprimerMembre,
    modifierMembre,
    recupMembreByIdUtilsateur,
}

