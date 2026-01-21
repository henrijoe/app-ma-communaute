"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const functions_1 = __importDefault(require("./functions"));
const functions_2 = require("../functions");
const fs = require("fs");
const path = require("path");
const albumDir = path.join(__dirname, '..', '..', '..', 'albums/');
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
const ajouterMembre = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // APPEL DIRECT à la fonction CORRECTE dans functions.ts
            // Cette fonction doit gérer elle-même l'insertion et retourner le membre
            const membreInsere = yield functions_1.default.ajouterMembre(data);
            // Déjà renvoyé par functions.ajouterMembre
            resolve(membreInsere);
        }
        catch (error) {
            console.error("Erreur dans services.ajouterMembre:", error);
            reject(error);
        }
    }));
};
const getFileToBase64 = (photoPath) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!photoPath || photoPath.trim() === '') {
                resolve('');
                return;
            }
            const file = path.join(albumDir, photoPath);
            if (fs.existsSync(file)) {
                const base64 = fs.readFileSync(file, 'base64');
                resolve(`data:image/jpeg;base64,${base64}`);
            }
            else {
                resolve('');
            }
        }
        catch (err) {
            console.log(`err => getFileToBase64 : `, err);
            resolve('');
        }
    }));
};
const recupMembre = () => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const membres = yield functions_1.default.recupMembre();
            // Récupérer les photos en base64 pour chaque membre
            const membresAvecPhotos = yield Promise.all(membres.map((item) => __awaiter(void 0, void 0, void 0, function* () {
                const photoMembre = yield getFileToBase64(item.photoMembre);
                return Object.assign(Object.assign({}, item), { photoMembre: photoMembre });
            })));
            resolve(membresAvecPhotos);
        }
        catch (error) {
            reject(error);
        }
    }));
};
// Recuperer les membres d'une eglise a partir de son utilisateur
const recupMembreByIdUtilsateur = (idUtilisateur) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const membereByUtilisateur = yield functions_1.default.recupMembreByIdUtilsateur(idUtilisateur);
            resolve(membereByUtilisateur);
        }
        catch (error) {
            console.log("🚀 ~ file: services.ts:830 ~ returnnewPromise ~ error:", error);
            reject(error);
        }
    }));
};
const supprimerMembre = (idMembre) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Appelle la fonction pour supprimer un membre
            yield functions_1.default.supprimerMembre(idMembre);
            // Renvoie l'objet contenant l'id du membre supprimé
            resolve({ idMembre: idMembre });
        }
        catch (error) {
            // En cas d'erreur, la rejette
            reject(error);
        }
    }));
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
const modifierMembre = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // 1. Gérer la photo si elle est en base64
            let photoFileName = data.photoMembre;
            if (data.photoMembre && data.photoMembre.startsWith('data:image/')) {
                // Extraire la partie base64
                const base64Data = data.photoMembre.replace(/^data:image\/\w+;base64,/, '');
                // Générer le nom de fichier
                photoFileName = `membre_${data.idMembre}.jpg`;
                // Sauvegarder le fichier
                const filePath = (0, functions_2.getAvatarsPath)(photoFileName);
                yield (0, functions_2.saveFileToBase64)(filePath, base64Data);
                console.log(`Photo sauvegardée: ${photoFileName}`);
            }
            // 2. Préparer les données avec le nom de fichier
            const updateData = Object.assign(Object.assign({}, data), { photoMembre: photoFileName // Remplace le base64 par le nom de fichier
             });
            // 3. Appeler la fonction existante de functions.ts
            yield functions_1.default.modifierMembre(updateData);
            // 4. Récupérer le membre mis à jour avec typage explicite
            const membreMisAJour = yield functions_1.default.recupMembreById(data.idMembre);
            // Vérifier que le résultat est un tableau
            if (Array.isArray(membreMisAJour) && membreMisAJour.length > 0) {
                resolve(membreMisAJour[0]);
            }
            else {
                reject(new Error("Membre non trouvé après modification"));
            }
        }
        catch (error) {
            console.error("Erreur dans services.modifierMembre:", error);
            reject(error);
        }
    }));
};
exports.default = {
    recupMembre,
    ajouterMembre,
    supprimerMembre,
    modifierMembre,
    recupMembreByIdUtilsateur,
};
//# sourceMappingURL=services.js.map